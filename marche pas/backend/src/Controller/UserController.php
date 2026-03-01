<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/users')]
#[IsGranted('ROLE_ADMIN')]
class UserController extends AbstractController
{
    public function __construct(
        private UserRepository $repository,
        private EntityManagerInterface $em
    ) {}

    // GET /api/users
    #[Route('', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
        $users = array_map(fn($u) => $u->toArray(), $this->repository->findAll());
        return $this->json($users);
    }

    // PUT /api/users/{id}/roles
    #[Route('/{id}/roles', methods: ['PUT'])]
    public function updateRoles(int $id, Request $request): JsonResponse
    {
        $user = $this->repository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Empêcher de modifier son propre rôle
        if ($user->getId() === $this->getUser()->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas modifier votre propre rôle'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['roles']) || !is_array($data['roles'])) {
            return $this->json(['error' => 'Rôles invalides'], 400);
        }

        $user->setRoles($data['roles']);
        $this->em->flush();

        return $this->json(['message' => 'Rôle mis à jour', 'user' => $user->toArray()]);
    }

    // DELETE /api/users/{id}
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->repository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Empêcher de se supprimer soi-même
        if ($user->getId() === $this->getUser()->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas vous supprimer vous-même'], 403);
        }

        $this->em->remove($user);
        $this->em->flush();

        return $this->json(['message' => 'Utilisateur supprimé']);
    }
}
