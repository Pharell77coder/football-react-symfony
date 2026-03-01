<?php

namespace App\Entity;

use App\Repository\EquipeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: EquipeRepository::class)]
#[ORM\Table(name: 'equipes')]
#[UniqueEntity(fields: ['nom'], message: 'Une équipe avec ce nom existe déjà')]
class Equipe
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire')]
    #[Assert\Length(min: 2, max: 255, minMessage: 'Le nom doit faire au moins {{ limit }} caractères')]
    private string $nom;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le pays est obligatoire')]
    private string $pays;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'La ville est obligatoire')]
    private string $ville;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stade = null;

    #[ORM\Column(length: 7, nullable: true)]
    #[Assert\Regex(pattern: '/^#[0-9A-Fa-f]{6}$/', message: 'La couleur doit être au format #RRGGBB')]
    private ?string $couleur = null;

    // Relation OneToMany → Joueurs
    #[ORM\OneToMany(mappedBy: 'equipe', targetEntity: Joueur::class, cascade: ['persist'])]
    private Collection $joueurs;

    #[ORM\OneToMany(mappedBy: 'equipeObj1', targetEntity: Rencontre::class)]
    private Collection $rencontresADomicile;

    #[ORM\OneToMany(mappedBy: 'equipeObj2', targetEntity: Rencontre::class)]
    private Collection $rencontresAExterieur;

    public function __construct()
    {
        $this->joueurs             = new ArrayCollection();
        $this->rencontresADomicile  = new ArrayCollection();
        $this->rencontresAExterieur = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getNom(): string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }

    public function getPays(): string { return $this->pays; }
    public function setPays(string $pays): static { $this->pays = $pays; return $this; }

    public function getVille(): string { return $this->ville; }
    public function setVille(string $ville): static { $this->ville = $ville; return $this; }

    public function getStade(): ?string { return $this->stade; }
    public function setStade(?string $stade): static { $this->stade = $stade; return $this; }

    public function getCouleur(): ?string { return $this->couleur; }
    public function setCouleur(?string $couleur): static { $this->couleur = $couleur; return $this; }

    public function getJoueurs(): Collection { return $this->joueurs; }
    public function getRencontresADomicile(): Collection { return $this->rencontresADomicile; }
    public function getRencontresAExterieur(): Collection { return $this->rencontresAExterieur; }

    // Logique métier : stats de l'équipe
    public function getStats(): array
    {
        $victoires = $nuls = $defaites = $butsMarques = $butsEncaisses = 0;

        foreach ($this->rencontresADomicile as $r) {
            $butsMarques   += $r->getScore1();
            $butsEncaisses += $r->getScore2();
            if ($r->getScore1() > $r->getScore2())      $victoires++;
            elseif ($r->getScore1() === $r->getScore2()) $nuls++;
            else                                          $defaites++;
        }

        foreach ($this->rencontresAExterieur as $r) {
            $butsMarques   += $r->getScore2();
            $butsEncaisses += $r->getScore1();
            if ($r->getScore2() > $r->getScore1())      $victoires++;
            elseif ($r->getScore1() === $r->getScore2()) $nuls++;
            else                                          $defaites++;
        }

        $matchsJoues = $victoires + $nuls + $defaites;
        $points      = ($victoires * 3) + $nuls;

        return [
            'matchs_joues'   => $matchsJoues,
            'victoires'      => $victoires,
            'nuls'           => $nuls,
            'defaites'       => $defaites,
            'buts_marques'   => $butsMarques,
            'buts_encaisses' => $butsEncaisses,
            'difference'     => $butsMarques - $butsEncaisses,
            'points'         => $points,
        ];
    }

    public function toArray(bool $withStats = false): array
    {
        $data = [
            'id'      => $this->id,
            'nom'     => $this->nom,
            'pays'    => $this->pays,
            'ville'   => $this->ville,
            'stade'   => $this->stade,
            'couleur' => $this->couleur,
            'nb_joueurs' => $this->joueurs->count(),
        ];

        if ($withStats) {
            $data['stats'] = $this->getStats();
        }

        return $data;
    }
}
