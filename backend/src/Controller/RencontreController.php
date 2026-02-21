<?php

namespace App\Controller;

use App\Entity\Rencontre;
use App\Repository\RencontreRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/rencontres')]
class RencontreController extends AbstractController
{
    public function __construct(
        private RencontreRepository $repository,
        private EntityManagerInterface $em
    ) {}

    // GET /api/rencontres
    #[Route('', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
        $rencontres = array_map(fn($r) => $r->toArray(), $this->repository->findAll());
        return $this->json($rencontres);
    }

    // GET /api/rencontres/saison/{saison}
    // ⚠️ Cette route DOIT être avant /{id} pour éviter les conflits
    #[Route('/saison/{saison}', methods: ['GET'])]
    public function getBySaison(int $saison): JsonResponse
    {
        $rencontres = array_map(fn($r) => $r->toArray(), $this->repository->findBySaison($saison));
        return $this->json($rencontres);
    }

    // GET /api/rencontres/equipe/{equipe}
    #[Route('/equipe/{equipe}', methods: ['GET'])]
    public function getByEquipe(string $equipe): JsonResponse
    {
        $rencontres = array_map(fn($r) => $r->toArray(), $this->repository->findByEquipe($equipe));
        return $this->json($rencontres);
    }

    // GET /api/rencontres/{id}
    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getById(int $id): JsonResponse
    {
        $rencontre = $this->repository->find($id);
        if (!$rencontre) {
            return $this->json(['error' => 'Rencontre non trouvée'], 404);
        }
        return $this->json($rencontre->toArray());
    }

    // POST /api/rencontres
    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $required = ['nom', 'date', 'equipe_1', 'equipe_2', 'journee', 'saison'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(['error' => "Champ manquant: $field"], 400);
            }
        }

        $rencontre = new Rencontre();
        $rencontre->setNom($data['nom']);
        $rencontre->setDate(new \DateTime($data['date']));
        $rencontre->setLieu($data['lieu'] ?? null);
        $rencontre->setEquipe1($data['equipe_1']);
        $rencontre->setEquipe2($data['equipe_2']);
        $rencontre->setScore1((int)($data['score_1'] ?? 0));
        $rencontre->setScore2((int)($data['score_2'] ?? 0));
        $rencontre->setJournee((int)$data['journee']);
        $rencontre->setSaison((int)$data['saison']);

        $this->em->persist($rencontre);
        $this->em->flush();

        return $this->json(['id' => $rencontre->getId(), 'message' => 'Rencontre créée'], 201);
    }

    // PUT /api/rencontres/{id}
    #[Route('/{id}', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $rencontre = $this->repository->find($id);
        if (!$rencontre) {
            return $this->json(['error' => 'Rencontre non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nom']))      $rencontre->setNom($data['nom']);
        if (isset($data['date']))     $rencontre->setDate(new \DateTime($data['date']));
        if (isset($data['lieu']))     $rencontre->setLieu($data['lieu']);
        if (isset($data['equipe_1'])) $rencontre->setEquipe1($data['equipe_1']);
        if (isset($data['equipe_2'])) $rencontre->setEquipe2($data['equipe_2']);
        if (isset($data['score_1']))  $rencontre->setScore1((int)$data['score_1']);
        if (isset($data['score_2']))  $rencontre->setScore2((int)$data['score_2']);
        if (isset($data['journee']))  $rencontre->setJournee((int)$data['journee']);
        if (isset($data['saison']))   $rencontre->setSaison((int)$data['saison']);

        $this->em->flush();

        return $this->json(['message' => 'Rencontre mise à jour']);
    }

    // DELETE /api/rencontres/{id}
    #[Route('/{id}', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $rencontre = $this->repository->find($id);
        if (!$rencontre) {
            return $this->json(['error' => 'Rencontre non trouvée'], 404);
        }

        $this->em->remove($rencontre);
        $this->em->flush();

        return $this->json(['message' => 'Rencontre supprimée']);
    }
}
