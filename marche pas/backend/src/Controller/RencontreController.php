<?php

namespace App\Controller;

use App\Entity\Rencontre;
use App\Repository\RencontreRepository;
use App\Service\StatsService;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[OA\Tag(name: 'Rencontres')]
#[Route('/api/rencontres')]
class RencontreController extends AbstractController
{
    public function __construct(
        private RencontreRepository $repository,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private StatsService $statsService
    ) {}

    // GET /api/rencontres?page=1&limit=10&saison=2025
    #[OA\Get(
        summary: 'Liste des rencontres avec pagination',
        parameters: [
            new OA\Parameter(name: 'page',   in: 'query', schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'limit',  in: 'query', schema: new OA\Schema(type: 'integer', default: 10)),
            new OA\Parameter(name: 'saison', in: 'query', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 200, description: 'Liste paginée')]
    )]
    #[Route('', methods: ['GET'])]
    public function getAll(Request $request): JsonResponse
    {
        $page   = max(1, (int)$request->query->get('page', 1));
        $limit  = min(50, max(1, (int)$request->query->get('limit', 100)));
        $saison = $request->query->get('saison');

        if ($saison) {
            $rencontres = $this->repository->findBySaison((int)$saison);
        } else {
            $rencontres = $this->repository->findAllPaginated($page, $limit);
        }

        $total = $this->repository->count([]);

        return $this->json([
            'data'        => array_map(fn($r) => $r->toArray(), $rencontres),
            'pagination'  => [
                'page'        => $page,
                'limit'       => $limit,
                'total'       => $total,
                'total_pages' => ceil($total / $limit),
            ],
        ]);
    }

    // GET /api/rencontres/saison/{saison}
    #[OA\Get(summary: 'Rencontres par saison')]
    #[Route('/saison/{saison}', methods: ['GET'])]
    public function getBySaison(int $saison): JsonResponse
    {
        $rencontres = array_map(fn($r) => $r->toArray(), $this->repository->findBySaison($saison));
        return $this->json($rencontres);
    }

    // GET /api/rencontres/equipe/{equipe}
    #[OA\Get(summary: 'Rencontres par équipe')]
    #[Route('/equipe/{equipe}', methods: ['GET'])]
    public function getByEquipe(string $equipe, Request $request): JsonResponse
    {
        $rencontres = array_map(fn($r) => $r->toArray(), $this->repository->findByEquipe($equipe));
        $forme      = $this->statsService->getFormeEquipe($equipe);

        return $this->json([
            'equipe'     => $equipe,
            'rencontres' => $rencontres,
            'forme'      => $forme,
            'total'      => count($rencontres),
        ]);
    }

    // GET /api/rencontres/classement/{saison}
    #[OA\Get(summary: 'Classement par saison')]
    #[Route('/classement/{saison}', methods: ['GET'])]
    public function getClassement(int $saison): JsonResponse
    {
        return $this->json($this->statsService->getClassement($saison));
    }

    // GET /api/rencontres/stats
    #[OA\Get(summary: 'Statistiques globales')]
    #[Route('/stats', methods: ['GET'])]
    public function getStats(): JsonResponse
    {
        return $this->json($this->statsService->getGlobalStats());
    }

    // GET /api/rencontres/{id}
    #[OA\Get(summary: 'Détail d\'une rencontre')]
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
    #[OA\Post(summary: 'Créer une rencontre')]
    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $rencontre = new Rencontre();
        $this->hydrate($rencontre, $data);

        // Validation métier : les deux équipes doivent être différentes
        if (strtolower(trim($data['equipe_1'] ?? '')) === strtolower(trim($data['equipe_2'] ?? ''))) {
            return $this->json(['errors' => ['Les deux équipes doivent être différentes']], 422);
        }

        $errors = $this->validator->validate($rencontre);
        if (count($errors) > 0) {
            return $this->json(['errors' => $this->formatErrors($errors)], 422);
        }

        $this->em->persist($rencontre);
        $this->em->flush();

        return $this->json(['id' => $rencontre->getId(), 'message' => 'Rencontre créée', 'data' => $rencontre->toArray()], 201);
    }

    // PUT /api/rencontres/{id}
    #[OA\Put(summary: 'Modifier une rencontre')]
    #[Route('/{id}', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $rencontre = $this->repository->find($id);
        if (!$rencontre) {
            return $this->json(['error' => 'Rencontre non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $this->hydrate($rencontre, $data);

        $errors = $this->validator->validate($rencontre);
        if (count($errors) > 0) {
            return $this->json(['errors' => $this->formatErrors($errors)], 422);
        }

        $this->em->flush();
        return $this->json(['message' => 'Rencontre mise à jour', 'data' => $rencontre->toArray()]);
    }

    // DELETE /api/rencontres/{id}
    #[OA\Delete(summary: 'Supprimer une rencontre')]
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

    private function hydrate(Rencontre $r, array $data): void
    {
        if (isset($data['nom']))      $r->setNom($data['nom']);
        if (isset($data['lieu']))     $r->setLieu($data['lieu']);
        if (isset($data['equipe_1'])) $r->setEquipe1($data['equipe_1']);
        if (isset($data['equipe_2'])) $r->setEquipe2($data['equipe_2']);
        if (isset($data['score_1']))  $r->setScore1((int)$data['score_1']);
        if (isset($data['score_2']))  $r->setScore2((int)$data['score_2']);
        if (isset($data['journee']))  $r->setJournee((int)$data['journee']);
        if (isset($data['saison']))   $r->setSaison((int)$data['saison']);
        if (isset($data['date']))     $r->setDate(new \DateTime($data['date']));
    }

    private function formatErrors(\Symfony\Component\Validator\ConstraintViolationListInterface $errors): array
    {
        $formatted = [];
        foreach ($errors as $error) {
            $formatted[$error->getPropertyPath()] = $error->getMessage();
        }
        return $formatted;
    }
}
