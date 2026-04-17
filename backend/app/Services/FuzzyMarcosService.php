<?php

namespace App\Services;

class FuzzyMarcosService
{
    // Mapping ENUM ke Level Fuzzy (1-5)
    private $enumToLevel = [
        // Kondisi Fisik (Benefit - semakin buruk semakin perlu pemeliharaan)
        'Sangat Baik' => 1,
        'Baik' => 2,
        'Cukup' => 3,
        'Buruk' => 4,
        'Sangat Buruk' => 5,

        // Usia Pemakaian (Benefit - semakin lama semakin perlu dipelihara)
        'Baru' => 1,
        'Relatif Baru' => 2,
        'Sedang' => 3,
        'Lama' => 4,
        'Sangat Lama' => 5,

        // Frekuensi Penggunaan (Benefit - semakin sering semakin perlu dipelihara)
        'Sangat Jarang' => 1,
        'Jarang' => 2,
        'Kadang' => 3,
        'Sering' => 4,
        'Sangat Sering' => 5,

        // Tingkat Urgensi (Benefit)
        'Tidak Urgen' => 1,
        'Rendah' => 2,
        'Sedang' => 3,
        'Urgen' => 4,
        'Sangat Urgen' => 5,

        // Biaya Pemeliharaan (Cost - semakin rendah semakin prioritas)
        'Sangat Tinggi' => 1,
        'Tinggi' => 2,
        'Sedang' => 3,
        'Rendah' => 4,
        'Sangat Rendah' => 5,

        // Nilai Ekonomis (Benefit - semakin tinggi semakin prioritas)
        'Sangat Rendah' => 1,
        'Rendah' => 2,
        'Sedang' => 3,
        'Tinggi' => 4,
        'Sangat Tinggi' => 5,
    ];

    // Triangular Fuzzy Number (TFN) - Sesuai Tabel 3.7 proposal
    private $levelToTFN = [
        1 => ['l' => 1, 'm' => 1, 'u' => 2],
        2 => ['l' => 1, 'm' => 2, 'u' => 3],
        3 => ['l' => 2, 'm' => 3, 'u' => 4],
        4 => ['l' => 3, 'm' => 4, 'u' => 5],
        5 => ['l' => 4, 'm' => 5, 'u' => 5],
    ];

    // Bobot Kriteria (Total = 1) - Sesuai Tabel proposal
    private $weights = [
        'kondisi_penilaian' => 0.25,      // C1 - 25%
        'usia_pemakaian_aset' => 0.15,    // C2 - 15%
        'frekuensi_penggunaan' => 0.20,   // C3 - 20%
        'tingkat_urgensi' => 0.10,        // C4 - 10%
        'biaya_pemeliharaan' => 0.15,     // C5 - 15% (COST)
        'nilai_ekonomis' => 0.15,         // C6 - 15%
    ];

    // Tipe Atribut
    private $criteriaTypes = [
        'kondisi_penilaian' => 'benefit',
        'usia_pemakaian_aset' => 'benefit',
        'frekuensi_penggunaan' => 'benefit',
        'tingkat_urgensi' => 'benefit',
        'biaya_pemeliharaan' => 'benefit', // Sudah dibalik di enumToLevel
        'nilai_ekonomis' => 'benefit',
    ];

    /**
     * Konversi ENUM ke TFN
     */
    public function convertToTFN($enumValue)
    {
        $level = $this->enumToLevel[$enumValue] ?? 3;
        return $this->levelToTFN[$level];
    }

    /**
     * Hitung Fuzzy MARCOS untuk satu penilaian
     * SESUAI PROPOSAL BAB 3
     */
    public function calculateSingleMarcos($penilaian)
    {
        // TAHAP 1: Fuzzifikasi - Konversi ENUM ke TFN
        $tfnData = [];
        foreach ($this->weights as $criteria => $weight) {
            $tfnData[$criteria] = $this->convertToTFN($penilaian[$criteria]);
        }

        // TAHAP 3: Penentuan Solusi Ideal dan Anti-Ideal
        // AI (Anti-Ideal) = Minimum untuk benefit
        // AAI (Ideal) = Maximum untuk benefit
        $AI = [];   // Anti-Ideal (terburuk)
        $AAI = [];  // Ideal (terbaik)
        
        foreach ($this->criteriaTypes as $criteria => $type) {
            $AI[$criteria] = ['l' => 1, 'm' => 1, 'u' => 2];    // Min TFN
            $AAI[$criteria] = ['l' => 4, 'm' => 5, 'u' => 5];   // Max TFN
        }

        // TAHAP 4: Normalisasi Matriks Keputusan
        // ✅ SESUAI PROPOSAL: Benefit dibagi dengan Anti-Ideal (AI)
        $normalized = [];
        foreach ($tfnData as $criteria => $xij) {
            $ai = $AI[$criteria];
            
            // Formula: n_ij = x_ij / x_ai (BENEFIT)
            $normalized[$criteria] = [
                'l' => $xij['l'] / $ai['u'],  // l/u (pembagi terbalik untuk TFN)
                'm' => $xij['m'] / $ai['m'],  // m/m
                'u' => $xij['u'] / $ai['l'],  // u/l (pembagi terbalik untuk TFN)
            ];
        }

        // TAHAP 5: Perhitungan Matriks Terbobot & Sum Baris
        $weighted = [];
        foreach ($this->weights as $criteria => $weight) {
            $n = $normalized[$criteria];
            $weighted[$criteria] = [
                'l' => $n['l'] * $weight,
                'm' => $n['m'] * $weight,
                'u' => $n['u'] * $weight,
            ];
        }

        // Hitung Si (Sum nilai terbobot)
        $Si = ['l' => 0, 'm' => 0, 'u' => 0];
        foreach ($weighted as $w) {
            $Si['l'] += $w['l'];
            $Si['m'] += $w['m'];
            $Si['u'] += $w['u'];
        }

        // Hitung S_AI dan S_AAI (solusi referensi)
        $S_AI = $this->calculateReferenceSolution($AI);
        $S_AAI = $this->calculateReferenceSolution($AAI);

        // Defuzzifikasi
        $Si_crisp = $this->defuzzify($Si);
        $S_AI_crisp = $this->defuzzify($S_AI);
        $S_AAI_crisp = $this->defuzzify($S_AAI);

        // TAHAP 6: Perhitungan Utility Degree
        // ✅ SESUAI PROPOSAL (Gambar 3):
        // Ki⁺ = Si / S_AI (dibagi Anti-Ideal)
        // Ki⁻ = Si / S_AAI (dibagi Ideal)
        $Ki_plus = $S_AI_crisp > 0 ? $Si_crisp / $S_AI_crisp : 0;
        $Ki_minus = $S_AAI_crisp > 0 ? $Si_crisp / $S_AAI_crisp : 0;

        // TAHAP 7: Fungsi Utilitas & Perankingan
        // Formula f(Ki) menggunakan rata-rata
        if ($Ki_plus > 0 || $Ki_minus > 0) {
            $f_Ki = ($Ki_plus + $Ki_minus) / 2;
        } else {
            $f_Ki = 0;
        }

        // Normalisasi ke skala 0-100
        $totalNilai = min(round($f_Ki * 100, 2), 100);

        return $totalNilai;
    }

    /**
     * Hitung nilai solusi referensi (S_AI atau S_AAI)
     */
    private function calculateReferenceSolution($reference)
    {
        $S = ['l' => 0, 'm' => 0, 'u' => 0];
        
        $ai = ['l' => 1, 'm' => 1, 'u' => 2]; // Anti-Ideal untuk normalisasi
        
        foreach ($this->weights as $criteria => $weight) {
            $xij = $reference[$criteria];
            
            // Normalisasi dengan Anti-Ideal
            $normalized = [
                'l' => $xij['l'] / $ai['u'],
                'm' => $xij['m'] / $ai['m'],
                'u' => $xij['u'] / $ai['l'],
            ];
            
            // Pembobotan
            $S['l'] += $normalized['l'] * $weight;
            $S['m'] += $normalized['m'] * $weight;
            $S['u'] += $normalized['u'] * $weight;
        }
        
        return $S;
    }

    /**
     * Defuzzifikasi menggunakan metode Centroid
     */
    public function defuzzify($tfn)
    {
        return ($tfn['l'] + $tfn['m'] + $tfn['u']) / 3;
    }

    /**
     * Hitung MARCOS untuk multiple penilaian (ranking)
     */
    public function calculateMultipleMarcos($penilaians)
    {
        $results = [];

        foreach ($penilaians as $penilaian) {
            $totalNilai = $this->calculateSingleMarcos($penilaian);
            
            $results[] = [
                'penilaian_id' => $penilaian['penilaian_id'] ?? null,
                'aset_id' => $penilaian['aset_id'],
                'total_nilai' => $totalNilai,
                'prioritas' => $this->getPrioritas($totalNilai),
            ];
        }

        // Urutkan berdasarkan total_nilai DESC
        usort($results, function($a, $b) {
            return $b['total_nilai'] <=> $a['total_nilai'];
        });

        return $results;
    }

    /**
     * Tentukan prioritas berdasarkan total nilai
     */
    private function getPrioritas($nilai)
    {
        if ($nilai >= 70) return 'Tinggi';
        if ($nilai >= 45) return 'Sedang';
        return 'Rendah';
    }
}