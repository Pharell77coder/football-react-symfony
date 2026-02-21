<?php

namespace App\Entity;

use App\Repository\RencontreRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RencontreRepository::class)]
#[ORM\Table(name: 'rencontres')]
class Rencontre
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $nom;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $date;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $lieu = null;

    #[ORM\Column(length: 255)]
    private string $equipe1;

    #[ORM\Column(length: 255)]
    private string $equipe2;

    #[ORM\Column(options: ['default' => 0])]
    private int $score1 = 0;

    #[ORM\Column(options: ['default' => 0])]
    private int $score2 = 0;

    #[ORM\Column]
    private int $journee;

    #[ORM\Column]
    private int $saison;

    // ===== GETTERS & SETTERS =====

    public function getId(): ?int { return $this->id; }

    public function getNom(): string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }

    public function getDate(): \DateTimeInterface { return $this->date; }
    public function setDate(\DateTimeInterface $date): static { $this->date = $date; return $this; }

    public function getLieu(): ?string { return $this->lieu; }
    public function setLieu(?string $lieu): static { $this->lieu = $lieu; return $this; }

    public function getEquipe1(): string { return $this->equipe1; }
    public function setEquipe1(string $equipe1): static { $this->equipe1 = $equipe1; return $this; }

    public function getEquipe2(): string { return $this->equipe2; }
    public function setEquipe2(string $equipe2): static { $this->equipe2 = $equipe2; return $this; }

    public function getScore1(): int { return $this->score1; }
    public function setScore1(int $score1): static { $this->score1 = $score1; return $this; }

    public function getScore2(): int { return $this->score2; }
    public function setScore2(int $score2): static { $this->score2 = $score2; return $this; }

    public function getJournee(): int { return $this->journee; }
    public function setJournee(int $journee): static { $this->journee = $journee; return $this; }

    public function getSaison(): int { return $this->saison; }
    public function setSaison(int $saison): static { $this->saison = $saison; return $this; }

    /**
     * Retourne les données en tableau (même format que l'ancienne API Python)
     */
    public function toArray(): array
    {
        return [
            'id'       => $this->id,
            'nom'      => $this->nom,
            'date'     => $this->date->format('Y-m-d H:i:s'),
            'lieu'     => $this->lieu,
            'equipe_1' => $this->equipe1,
            'equipe_2' => $this->equipe2,
            'score_1'  => $this->score1,
            'score_2'  => $this->score2,
            'journee'  => $this->journee,
            'saison'   => $this->saison,
        ];
    }
}
