<?php

namespace App\Repository;

use App\Entity\Equipe;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class EquipeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Equipe::class);
    }

    public function findByPays(string $pays): array
    {
        return $this->createQueryBuilder('e')
            ->where('LOWER(e.pays) = LOWER(:pays)')
            ->setParameter('pays', $pays)
            ->orderBy('e.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
