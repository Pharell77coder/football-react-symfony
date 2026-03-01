<?php

namespace App\Entity;

use App\Repository\RencontreRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: RencontreRepository::class)]
#[ORM\Table(name: 'rencontres')]
class Rencontre
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le nom de la compétition est obligatoire')]
    #[Assert\Length(min: 2, max: 255)]
    private string $nom;

    #[ORM\Column(type: 'datetime')]
    #[Assert\NotNull(message: 'La date est obligatoire')]
    private \DateTimeInterface $date;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le lieu est obligatoire')]
    private string $lieu;

    // Noms libres (pour compatibilité fixtures UCL sans entités Equipe)
    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'L\'équipe 1 est obligatoire')]
    private string $equipe1;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'L\'équipe 2 est obligatoire')]
    private string $equipe2;

    #[ORM\Column]
    #[Assert\Range(min: 0, max: 50, notInRangeMessage: 'Le score doit être entre {{ min }} et {{ max }}')]
    private int $score1 = 0;

    #[ORM\Column]
    #[Assert\Range(min: 0, max: 50)]
    private int $score2 = 0;

    #[ORM\Column]
    #[Assert\Range(min: 1, max: 100)]
    private int $journee = 1;

    #[ORM\Column]
    #[Assert\Range(min: 2000, max: 2100, notInRangeMessage: 'La saison doit être entre {{ min }} et {{ max }}')]
    private int $saison;

    // Relations ManyToOne → Equipe (optionnel, si les équipes sont dans la BDD)
    #[ORM\ManyToOne(targetEntity: Equipe::class, inversedBy: 'rencontresADomicile')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Equipe $equipeObj1 = null;

    #[ORM\ManyToOne(targetEntity: Equipe::class, inversedBy: 'rencontresAExterieur')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Equipe $equipeObj2 = null;

    public function getId(): ?int { return $this->id; }

    public function getNom(): string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }

    public function getDate(): \DateTimeInterface { return $this->date; }
    public function setDate(\DateTimeInterface $date): static { $this->date = $date; return $this; }

    public function getLieu(): string { return $this->lieu; }
    public function setLieu(string $lieu): static { $this->lieu = $lieu; return $this; }

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

    public function getEquipeObj1(): ?Equipe { return $this->equipeObj1; }
    public function setEquipeObj1(?Equipe $e): static { $this->equipeObj1 = $e; return $this; }

    public function getEquipeObj2(): ?Equipe { return $this->equipeObj2; }
    public function setEquipeObj2(?Equipe $e): static { $this->equipeObj2 = $e; return $this; }

    // Logique métier
    public function getResultat(): string
    {
        if ($this->score1 > $this->score2) return 'equipe1';
        if ($this->score2 > $this->score1) return 'equipe2';
        return 'nul';
    }

    public function getTotalButs(): int
    {
        return $this->score1 + $this->score2;
    }

    public function isHighScoring(): bool
    {
        return $this->getTotalButs() >= 4;
    }

    public function toArray(): array
    {
        return [
            'id'        => $this->id,
            'nom'       => $this->nom,
            'date'      => $this->date->format('Y-m-d H:i:s'),
            'lieu'      => $this->lieu,
            'equipe_1'  => $this->equipe1,
            'equipe_2'  => $this->equipe2,
            'score_1'   => $this->score1,
            'score_2'   => $this->score2,
            'journee'   => $this->journee,
            'saison'    => $this->saison,
            'resultat'  => $this->getResultat(),
            'total_buts'=> $this->getTotalButs(),
            'high_scoring' => $this->isHighScoring(),
        ];
    }
}
