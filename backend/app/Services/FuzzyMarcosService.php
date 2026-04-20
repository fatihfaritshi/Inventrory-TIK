<?php

namespace App\Services;

class FuzzyMarcosService
{
    private array $criteriaEnumMap = [
        'kondisi_penilaian' => [
            'Sangat Baik' => 1, 
            'Baik' => 2, 
            'Cukup' => 3,
            'Buruk' => 4, 
            'Sangat Buruk' => 5,
        ],
        'usia_pemakaian_aset' => [
            'Baru' => 1, 
            'Relatif Baru' => 2, 
            'Sedang' => 3,
            'Lama' => 4, 
            'Sangat Lama' => 5,
        ],
        'frekuensi_penggunaan' => [
            'Sangat Jarang' => 1, 
            'Jarang' => 2, 
            'Kadang' => 3,
            'Sering' => 4, 
            'Sangat Sering' => 5,
        ],
        'tingkat_urgensi' => [
            'Tidak Urgen' => 1, 
            'Rendah' => 2, 
            'Sedang' => 3,
            'Urgen' => 4, 
            'Sangat Urgen' => 5,
        ],
        'biaya_pemeliharaan' => [
            'Sangat Rendah' => 1, 
            'Rendah' => 2, 
            'Sedang' => 3,
            'Tinggi' => 4, 
            'Sangat Tinggi' => 5,
        ],
        'nilai_ekonomis' => [
            'Sangat Rendah' => 1, 
            'Rendah' => 2, 
            'Sedang' => 3,
            'Tinggi' => 4, 
            'Sangat Tinggi' => 5,
        ],
    ];

    private array $levelToTFN = [
        1 => ['l' => 1, 'm' => 1, 'u' => 2],
        2 => ['l' => 1, 'm' => 2, 'u' => 3],
        3 => ['l' => 2, 'm' => 3, 'u' => 4],
        4 => ['l' => 3, 'm' => 4, 'u' => 5],
        5 => ['l' => 4, 'm' => 5, 'u' => 5],
    ];

    private array $weights = [
        'kondisi_penilaian'    => 0.25,
        'usia_pemakaian_aset'  => 0.15,
        'frekuensi_penggunaan' => 0.20,
        'tingkat_urgensi'      => 0.10,
        'biaya_pemeliharaan'   => 0.15,
        'nilai_ekonomis'       => 0.15,
    ];

    private array $criteriaTypes = [
        'kondisi_penilaian'    => 'benefit',
        'usia_pemakaian_aset'  => 'benefit',
        'frekuensi_penggunaan' => 'benefit',
        'tingkat_urgensi'      => 'benefit',
        'biaya_pemeliharaan'   => 'cost',
        'nilai_ekonomis'       => 'benefit',
    ];

    // Defuzzifikasi centroid
    public function defuzzify(array $tfn): float
    {
        return ($tfn['l'] + $tfn['m'] + $tfn['u']) / 3.0;
    }

    // Konversi ENUM → crisp score (defuzzify dari TFN level)
    private function getCrispScore(string $criteria, string $enumValue): float
    {
        $level = $this->criteriaEnumMap[$criteria][$enumValue] ?? 3;
        return $this->defuzzify($this->levelToTFN[$level]);
    }

    public function calculateMultipleMarcos(array $penilaians): array
    {
        if (empty($penilaians)) return [];

        $criteriaKeys = array_keys($this->weights);

        // ── TAHAP 1: Konversi ENUM → crisp score ─────────────────
        // Defuzzify TFN setiap level:
        // Level 1: (1+1+2)/3 = 1.333
        // Level 2: (1+2+3)/3 = 2.000
        // Level 3: (2+3+4)/3 = 3.000
        // Level 4: (3+4+5)/3 = 4.000
        // Level 5: (4+5+5)/3 = 4.667
        $scores = [];
        foreach ($penilaians as $i => $p) {
            foreach ($criteriaKeys as $c) {
                $scores[$i][$c] = $this->getCrispScore($c, $p[$c]);
            }
        }

        // ── TAHAP 2: AI & AAI berbasis skala tetap 1-5 ───────────
        // Benefit → AI = crisp(level 5) = 4.667, AAI = crisp(level 1) = 1.333
        // Cost    → AI = crisp(level 1) = 1.333, AAI = crisp(level 5) = 4.667
        $crispLevel1 = $this->defuzzify($this->levelToTFN[1]); // 1.333
        $crispLevel5 = $this->defuzzify($this->levelToTFN[5]); // 4.667

        $AI  = [];
        $AAI = [];
        foreach ($criteriaKeys as $c) {
            if ($this->criteriaTypes[$c] === 'benefit') {
                $AI[$c]  = $crispLevel5; // 4.667
                $AAI[$c] = $crispLevel1; // 1.333
            } else {
                $AI[$c]  = $crispLevel1; // 1.333 (biaya rendah = ideal)
                $AAI[$c] = $crispLevel5; // 4.667 (biaya tinggi = terburuk)
            }
        }

        // ── TAHAP 3: Normalisasi ──────────────────────────────────
        // Benefit: n_ij = x_ij / AAI_j
        // Cost:    n_ij = AI_j  / x_ij
        $normalized = [];
        foreach ($scores as $i => $row) {
            foreach ($criteriaKeys as $c) {
                if ($this->criteriaTypes[$c] === 'benefit') {
                    $normalized[$i][$c] = $AAI[$c] > 0
                        ? $row[$c] / $AAI[$c]
                        : 0;
                } else {
                    $normalized[$i][$c] = $row[$c] > 0
                        ? $AI[$c] / $row[$c]
                        : 0;
                }
            }
        }

        // ── TAHAP 4 & 5: Weighted sum → Si ───────────────────────
        $Si = [];
        foreach ($normalized as $i => $row) {
            $sum = 0;
            foreach ($criteriaKeys as $c) {
                $sum += $row[$c] * $this->weights[$c];
            }
            $Si[$i] = $sum;
        }

        // ── TAHAP 6: S_AI dan S_AAI ───────────────────────────────
        // S_AI  = weighted sum normalisasi baris AI
        // S_AAI = weighted sum normalisasi baris AAI
        $S_AI  = 0;
        $S_AAI = 0;

        foreach ($criteriaKeys as $c) {
            $w = $this->weights[$c];

            if ($this->criteriaTypes[$c] === 'benefit') {
                // n_AI  = AI / AAI  = 4.667 / 1.333 = 3.500
                // n_AAI = AAI / AAI = 1.333 / 1.333 = 1.000
                $nAI  = $AAI[$c] > 0 ? $AI[$c]  / $AAI[$c] : 0;
                $nAAI = $AAI[$c] > 0 ? $AAI[$c] / $AAI[$c] : 0;
            } else {
                // Cost:
                // n_AI  = AI / AI   = 1.333 / 1.333 = 1.000
                // n_AAI = AI / AAI  = 1.333 / 4.667 = 0.286
                $nAI  = $AI[$c]  > 0 ? $AI[$c]  / $AI[$c]  : 0;
                $nAAI = $AAI[$c] > 0 ? $AI[$c]  / $AAI[$c] : 0;
            }

            $S_AI  += $nAI  * $w;
            $S_AAI += $nAAI * $w;
        }

        // Debug: S_AI dan S_AAI seharusnya:
        // S_AI  ≈ 3.5 * (0.25+0.15+0.20+0.10+0.15) + 1.0 * 0.15 = 3.5*0.85 + 0.15 = 3.125
        // S_AAI ≈ 1.0 * (0.25+0.15+0.20+0.10+0.15) + 0.286*0.15 = 0.85 + 0.043 = 0.893

        // ── TAHAP 7 & 8: Utility Degree ──────────────────────────
        $results = [];
        foreach ($Si as $i => $si) {
            $Ki_plus  = $S_AI  > 0 ? $si / $S_AI  : 0;
            $Ki_minus = $S_AAI > 0 ? $si / $S_AAI : 0;

            // f(Ki) = (Ki+ + Ki-) / 2
            $f_Ki = ($Ki_plus + $Ki_minus) / 2.0;

            // Nilai f_Ki yang diharapkan:
            // Semua terbaik  → Si ≈ S_AI  → Ki+ ≈ 1.0, Ki- ≈ S_AI/S_AAI ≈ 3.5 → f ≈ 2.25 → 100 (capped)
            // Semua sedang   → Si ≈ ~1.7  → Ki+ ≈ 0.54, Ki- ≈ 1.9  → f ≈ 1.22 → capped 100
            //
            // Masalah: range f_Ki tidak 0-1, perlu normalisasi ke range [S_AAI, S_AI]
            // Gunakan: skor = (Si - S_AAI) / (S_AI - S_AAI) * 100
            $range = $S_AI - $S_AAI;
            $totalNilai = $range > 0
                ? round(($si - $S_AAI) / $range * 100, 2)
                : 0;

            $totalNilai = max(0, min(100, $totalNilai));

            $results[] = [
                'penilaian_id' => $penilaians[$i]['penilaian_id'] ?? null,
                'aset_id'      => $penilaians[$i]['aset_id']      ?? null,
                'Si'           => round($si, 4),
                'S_AI'         => round($S_AI, 4),
                'S_AAI'        => round($S_AAI, 4),
                'Ki_plus'      => round($Ki_plus, 4),
                'Ki_minus'     => round($Ki_minus, 4),
                'f_Ki'         => round($f_Ki, 4),
                'total_nilai'  => $totalNilai,
                'prioritas'    => $this->getPrioritas($totalNilai),
            ];
        }

        // ── TAHAP 9: Ranking ──────────────────────────────────────
        usort($results, fn($a, $b) => $b['total_nilai'] <=> $a['total_nilai']);

        return $results;
    }

    public function calculateSingleMarcos(array $penilaian): float
    {
        $results = $this->calculateMultipleMarcos([$penilaian]);
        return $results[0]['total_nilai'] ?? 0;
    }

    private function getPrioritas(float $nilai): string
    {
        if ($nilai >= 70) return 'Tinggi';
        if ($nilai >= 45) return 'Sedang';
        return 'Rendah';
    }
}