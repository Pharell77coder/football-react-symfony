<?php

namespace App\Controller;

use App\Entity\Equipe;
use App\Repository\EquipeRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[OA\Tag(name: 'Équipes')]
#[Route('/api/equipes')]
class EquipeController extends AbstractController
{
    public function __construct(
        private EquipeRepository $repository,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator
    ) {}

    // GET /api/equipes
    #[OA\Get(summary: 'Liste de toutes les équipes')]
    #[Route('', methods: ['GET'])]
    public function getAll(Request $request): JsonResponse
    {
        $withStats = $request->query->getBoolean('stats', false);
        $equipes   = array_map(fn($e) => $e->toArray($withStats), $this->repository->findAll());
        return $this->json($equipes);
    }

    // GET /api/equipes/{id}
    #[OA\Get(summary: 'Détail d\'une équipe avec stats')]
    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getById(int $id): JsonResponse
    {
        $equipe = $this->repository->find($id);
        if (!$equipe) {
            return $this->json(['error' => 'Équipe non trouvée'], 404);
        }
        return $this->json($equipe->toArray(true));
    }

    // POST /api/equipes
    #[OA\Post(summary: 'Créer une équipe')]
    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data) return $this->json(['error' => 'JSON invalide'], 400);

        $equipe = new Equipe();
        $this->hydrate($equipe, $data);

        $errors = $this->validator->validate($equipe);
        if (count($errors) > 0) {
            return $this->json(['errors' => $this->formatErrors($errors)], 422);
        }

        $this->em->persist($equipe);
        $this->em->flush();

        return $this->json(['id' => $equipe->getId(), 'message' => 'Équipe créée', 'data' => $equipe->toArray()], 201);
    }

    // PUT /api/equipes/{id}
    #[Route('/{id}', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $equipe = $this->repository->find($id);
        if (!$equipe) return $this->json(['error' => 'Équipe non trouvée'], 404);

        $data = json_decode($request->getContent(), true);
        $this->hydrate($equipe, $data);

        $errors = $this->validator->validate($equipe);
        if (count($errors) > 0) {
            return $this->json(['errors' => $this->formatErrors($errors)], 422);
        }

        $this->em->flush();
        return $this->json(['message' => 'Équipe mise à jour', 'data' => $equipe->toArray()]);
    }

    // DELETE /api/equipes/{id}
    #[Route('/{id}', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $equipe = $this->repository->find($id);
        if (!$equipe) return $this->json(['error' => 'Équipe non trouvée'], 404);

        $this->em->remove($equipe);
        $this->em->flush();

        return $this->json(['message' => 'Équipe supprimée']);
    }

    private function hydrate(Equipe $e, array $data): void
    {
        if (isset($data['nom']))     $e->setNom($data['nom']);
        if (isset($data['pays']))    $e->setPays($data['pays']);
        if (isset($data['ville']))   $e->setVille($data['ville']);
        if (isset($data['stade']))   $e->setStade($data['stade']);
        if (isset($data['couleur'])) $e->setCouleur($data['couleur']);
    }

    private function formatErrors($errors): array
    {
        $formatted = [];
        foreach ($errors as $e) {
            $formatted[$e->getPropertyPath()] = $e->getMessage();
        }
        return $formatted;
    }
}
