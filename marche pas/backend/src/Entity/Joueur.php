<?php

namespace App\Entity;

use App\Repository\JoueurRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: JoueurRepository::class)]
#[ORM\Table(name: 'joueurs')]
class Joueur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire')]
    #[Assert\Length(min: 2, max: 255)]
    private string $nom;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le prénom est obligatoire')]
    #[Assert\Length(min: 2, max: 255)]
    private string $prenom;

    #[ORM\Column(length: 100)]
    private string $nationalite = '';

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(message: 'Le poste est obligatoire')]
    #[Assert\Choice(
        choices: ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'],
        message: 'Poste invalide. Valeurs acceptées : Gardien, Défenseur, Milieu, Attaquant'
    )]
    private string $poste;

    #[ORM\Column]
    #[Assert\Range(min: 0, max: 200, notInRangeMessage: 'Le nombre de buts doit être entre {{ min }} et {{ max }}')]
    private int $buts = 0;

    #[ORM\Column]
    #[Assert\Range(min: 0, max: 200)]
    private int $passesDecisives = 0;

    #[ORM\Column]
    #[Assert\Range(min: 0, max: 10000)]
    private int $minutesJouees = 0;

    #[ORM\Column]
    #[Assert\Range(min: 0, max: 100)]
    private int $matchsJoues = 0;

    #[ORM\Column(options: ['default' => false])]
    private bool $equipeType = false;

    // Relation ManyToOne → Equipe
    #[ORM\ManyToOne(targetEntity: Equipe::class, inversedBy: 'joueurs')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Equipe $equipe = null;

    public function getId(): ?int { return $this->id; }

    public function getNom(): string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }

    public function getPrenom(): string { return $this->prenom; }
    public function setPrenom(string $prenom): static { $this->prenom = $prenom; return $this; }

    public function getNationalite(): string { return $this->nationalite; }
    public function setNationalite(string $nationalite): static { $this->nationalite = $nationalite; return $this; }

    public function getPoste(): string { return $this->poste; }
    public function setPoste(string $poste): static { $this->poste = $poste; return $this; }

    public function getButs(): int { return $this->buts; }
    public function setButs(int $buts): static { $this->buts = $buts; return $this; }

    public function getPassesDecisives(): int { return $this->passesDecisives; }
    public function setPassesDecisives(int $pd): static { $this->passesDecisives = $pd; return $this; }

    public function getMinutesJouees(): int { return $this->minutesJouees; }
    public function setMinutesJouees(int $m): static { $this->minutesJouees = $m; return $this; }

    public function getMatchsJoues(): int { return $this->matchsJoues; }
    public function setMatchsJoues(int $m): static { $this->matchsJoues = $m; return $this; }

    public function isEquipeType(): bool { return $this->equipeType; }
    public function setEquipeType(bool $e): static { $this->equipeType = $e; return $this; }

    public function getEquipe(): ?Equipe { return $this->equipe; }
    public function setEquipe(?Equipe $equipe): static { $this->equipe = $equipe; return $this; }

    // Logique métier : ratio buts/match
    public function getRatioButs(): float
    {
        if ($this->matchsJoues === 0) return 0;
        return round($this->buts / $this->matchsJoues, 2);
    }

    public function getClub(): string
    {
        return $this->equipe?->getNom() ?? '';
    }

    public function toArray(): array
    {
        return [
            'id'               => $this->id,
            'nom'              => $this->nom,
            'prenom'           => $this->prenom,
            'nom_complet'      => $this->prenom . ' ' . $this->nom,
            'club'             => $this->getClub(),
            'equipe_id'        => $this->equipe?->getId(),
            'nationalite'      => $this->nationalite,
            'poste'            => $this->poste,
            'buts'             => $this->buts,
            'passes_decisives' => $this->passesDecisives,
            'minutes_jouees'   => $this->minutesJouees,
            'matchs_joues'     => $this->matchsJoues,
            'ratio_buts'       => $this->getRatioButs(),
            'equipe_type'      => $this->equipeType,
        ];
    }
}
