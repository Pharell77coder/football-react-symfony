<?php

namespace App\Repository;

use App\Entity\Rencontre;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RencontreRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Rencontre::class);
    }

    public function findBySaison(int $saison): array
    {
        return $this->findBy(['saison' => $saison], ['id' => 'ASC']);
    }

    public function findByEquipe(string $equipe): array
    {
        return $this->createQueryBuilder('r')
            ->where('LOWER(r.equipe1) = LOWER(:equipe) OR LOWER(r.equipe2) = LOWER(:equipe)')
            ->setParameter('equipe', $equipe)
            ->orderBy('r.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
