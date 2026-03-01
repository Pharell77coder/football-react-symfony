<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[OA\Tag(name: 'Authentification')]
#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private ValidatorInterface $validator
    ) {}

    #[OA\Post(
        summary: 'Inscription',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'username', 'password'],
                properties: [
                    new OA\Property(property: 'email',    type: 'string', example: 'user@example.com'),
                    new OA\Property(property: 'username', type: 'string', example: 'MonPseudo'),
                    new OA\Property(property: 'password', type: 'string', example: 'motdepasse123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Inscription réussie'),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 409, description: 'Email déjà utilisé'),
        ]
    )]
    #[Route('/inscription', methods: ['POST'])]
    public function inscription(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $user = new User();
        $user->setEmail($data['email'] ?? '');
        $user->setUsername($data['username'] ?? '');
        $user->setPlainPassword($data['password'] ?? '');

        // Validation Symfony
        $errors = $this->validator->validate($user, null, ['Default', 'registration']);
        if (count($errors) > 0) {
            $formatted = [];
            foreach ($errors as $e) {
                $formatted[$e->getPropertyPath()] = $e->getMessage();
            }
            return $this->json(['errors' => $formatted], 422);
        }

        // Email unique
        if ($this->userRepository->findOneBy(['email' => $user->getEmail()])) {
            return $this->json(['error' => 'Cet email est déjà utilisé'], 409);
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $user->getPlainPassword()));
        $user->eraseCredentials();

        $this->em->persist($user);
        $this->em->flush();

        $token = $this->jwtManager->create($user);

        return $this->json([
            'message' => 'Inscription réussie',
            'token'   => $token,
            'user'    => $user->toArray(),
        ], 201);
    }

    #[OA\Post(
        summary: 'Connexion',
        responses: [
            new OA\Response(response: 200, description: 'Connexion réussie avec token JWT'),
            new OA\Response(response: 401, description: 'Identifiants incorrects'),
        ]
    )]
    #[Route('/connexion', methods: ['POST'])]
    public function connexion(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->json(['error' => 'Email et mot de passe requis'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $data['email']]);

        if (!$user || !$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Email ou mot de passe incorrect'], 401);
        }

        $token = $this->jwtManager->create($user);

        return $this->json([
            'message' => 'Connexion réussie',
            'token'   => $token,
            'user'    => $user->toArray(),
        ]);
    }

    #[OA\Get(summary: 'Profil de l\'utilisateur connecté')]
    #[Route('/me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }
        return $this->json($user->toArray());
    }

    #[Route('/deconnexion', methods: ['POST'])]
    public function deconnexion(): JsonResponse
    {
        return $this->json(['message' => 'Déconnexion réussie']);
    }
}
