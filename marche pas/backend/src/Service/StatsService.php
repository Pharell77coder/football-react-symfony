<?php

namespace App\Service;

use App\Repository\RencontreRepository;
use App\Repository\JoueurRepository;
use App\Repository\EquipeRepository;

/**
 * Service de logique métier pour les statistiques football
 */
class StatsService
{
    public function __construct(
        private RencontreRepository $rencontreRepo,
        private JoueurRepository    $joueurRepo,
        private EquipeRepository    $equipeRepo
    ) {}

    /**
     * Calcule le classement général par saison
     */
    public function getClassement(int $saison): array
    {
        $rencontres = $this->rencontreRepo->findBySaison($saison);
        $classement = [];

        foreach ($rencontres as $r) {
            $e1 = $r->getEquipe1();
            $e2 = $r->getEquipe2();

            if (!isset($classement[$e1])) $classement[$e1] = $this->initEquipeStats($e1);
            if (!isset($classement[$e2])) $classement[$e2] = $this->initEquipeStats($e2);

            $classement[$e1]['matchs_joues']++;
            $classement[$e2]['matchs_joues']++;
            $classement[$e1]['buts_marques']   += $r->getScore1();
            $classement[$e1]['buts_encaisses'] += $r->getScore2();
            $classement[$e2]['buts_marques']   += $r->getScore2();
            $classement[$e2]['buts_encaisses'] += $r->getScore1();

            if ($r->getScore1() > $r->getScore2()) {
                $classement[$e1]['victoires']++;
                $classement[$e1]['points'] += 3;
                $classement[$e2]['defaites']++;
            } elseif ($r->getScore1() < $r->getScore2()) {
                $classement[$e2]['victoires']++;
                $classement[$e2]['points'] += 3;
                $classement[$e1]['defaites']++;
            } else {
                $classement[$e1]['nuls']++;
                $classement[$e1]['points']++;
                $classement[$e2]['nuls']++;
                $classement[$e2]['points']++;
            }
        }

        foreach ($classement as &$stats) {
            $stats['difference_buts'] = $stats['buts_marques'] - $stats['buts_encaisses'];
        }

        // Trier par points, puis différence de buts
        usort($classement, function ($a, $b) {
            if ($b['points'] !== $a['points']) return $b['points'] - $a['points'];
            return $b['difference_buts'] - $a['difference_buts'];
        });

        // Ajouter le rang
        foreach ($classement as $i => &$stats) {
            $stats['rang'] = $i + 1;
        }

        return array_values($classement);
    }

    /**
     * Statistiques générales de l'application
     */
    public function getGlobalStats(): array
    {
        $rencontres = $this->rencontreRepo->findAll();
        $joueurs    = $this->joueurRepo->findAll();

        $totalButs        = 0;
        $highScoringGames = 0;
        $cleanSheets      = 0;

        foreach ($rencontres as $r) {
            $totalButs += $r->getTotalButs();
            if ($r->isHighScoring())            $highScoringGames++;
            if ($r->getScore1() === 0 || $r->getScore2() === 0) $cleanSheets++;
        }

        $nbMatchs = count($rencontres);

        return [
            'total_matchs'       => $nbMatchs,
            'total_joueurs'      => count($joueurs),
            'total_buts'         => $totalButs,
            'moyenne_buts'       => $nbMatchs > 0 ? round($totalButs / $nbMatchs, 2) : 0,
            'high_scoring_games' => $highScoringGames,
            'clean_sheets'       => $cleanSheets,
            'saisons'            => $this->rencontreRepo->getSaisons(),
        ];
    }

    /**
     * Forme récente d'une équipe (5 derniers matchs)
     */
    public function getFormeEquipe(string $equipe): array
    {
        $rencontres = $this->rencontreRepo->findByEquipeRecent($equipe, 5);
        $forme      = [];

        foreach ($rencontres as $r) {
            $estEquipe1 = strtolower($r->getEquipe1()) === strtolower($equipe);
            $scoreEquipe  = $estEquipe1 ? $r->getScore1() : $r->getScore2();
            $scoreAdverse = $estEquipe1 ? $r->getScore2() : $r->getScore1();

            if ($scoreEquipe > $scoreAdverse)      $forme[] = 'V';
            elseif ($scoreEquipe < $scoreAdverse)  $forme[] = 'D';
            else                                   $forme[] = 'N';
        }

        return $forme;
    }

    private function initEquipeStats(string $nom): array
    {
        return [
            'equipe'          => $nom,
            'matchs_joues'    => 0,
            'victoires'       => 0,
            'nuls'            => 0,
            'defaites'        => 0,
            'buts_marques'    => 0,
            'buts_encaisses'  => 0,
            'difference_buts' => 0,
            'points'          => 0,
        ];
    }
}
