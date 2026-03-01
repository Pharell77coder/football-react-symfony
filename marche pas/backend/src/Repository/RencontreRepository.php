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

    public function findAllPaginated(int $page, int $limit): array
    {
        return $this->createQueryBuilder('r')
            ->orderBy('r.date', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findBySaison(int $saison): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.saison = :saison')
            ->setParameter('saison', $saison)
            ->orderBy('r.date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByEquipe(string $equipe): array
    {
        return $this->createQueryBuilder('r')
            ->where('LOWER(r.equipe1) LIKE LOWER(:equipe)')
            ->orWhere('LOWER(r.equipe2) LIKE LOWER(:equipe)')
            ->setParameter('equipe', '%' . $equipe . '%')
            ->orderBy('r.date', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByEquipeRecent(string $equipe, int $limit = 5): array
    {
        return $this->createQueryBuilder('r')
            ->where('LOWER(r.equipe1) LIKE LOWER(:equipe)')
            ->orWhere('LOWER(r.equipe2) LIKE LOWER(:equipe)')
            ->setParameter('equipe', '%' . $equipe . '%')
            ->orderBy('r.date', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function getSaisons(): array
    {
        $result = $this->createQueryBuilder('r')
            ->select('DISTINCT r.saison')
            ->orderBy('r.saison', 'DESC')
            ->getQuery()
            ->getResult();

        return array_column($result, 'saison');
    }
}
