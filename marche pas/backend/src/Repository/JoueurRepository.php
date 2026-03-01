<?php

namespace App\Repository;

use App\Entity\Joueur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class JoueurRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Joueur::class);
    }

    public function findTopButeurs(int $limit = 10): array
    {
        return $this->createQueryBuilder('j')
            ->orderBy('j.buts', 'DESC')
            ->addOrderBy('j.minutesJouees', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findTopPasseurs(int $limit = 10): array
    {
        return $this->createQueryBuilder('j')
            ->orderBy('j.passesDecisives', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findEquipeType(): array
    {
        return $this->createQueryBuilder('j')
            ->where('j.equipeType = true')
            ->orderBy('j.poste', 'ASC')
            ->getQuery()
            ->getResult();
    }
}