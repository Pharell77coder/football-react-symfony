<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager
    ) {}

    // POST /api/auth/inscription
    #[Route('/inscription', methods: ['POST'])]
    public function inscription(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation
        $required = ['email', 'username', 'password'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(['error' => "Champ manquant: $field"], 400);
            }
        }

        // Email déjà utilisé ?
        if ($this->userRepository->findOneBy(['email' => $data['email']])) {
            return $this->json(['error' => 'Cet email est déjà utilisé'], 409);
        }

        // Validation email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Email invalide'], 400);
        }

        // Validation mot de passe (min 6 caractères)
        if (strlen($data['password']) < 6) {
            return $this->json(['error' => 'Le mot de passe doit faire au moins 6 caractères'], 400);
        }

        // Créer l'utilisateur
        $user = new User();
        $user->setEmail($data['email']);
        $user->setUsername($data['username']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));

        $this->em->persist($user);
        $this->em->flush();

        // Générer le token JWT
        $token = $this->jwtManager->create($user);

        return $this->json([
            'message' => 'Inscription réussie',
            'token'   => $token,
            'user'    => $user->toArray(),
        ], 201);
    }

    // POST /api/auth/connexion
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

    // GET /api/auth/me
    #[Route('/me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        return $this->json($user->toArray());
    }

    // POST /api/auth/deconnexion
    // La déconnexion est gérée côté frontend (suppression du token)
    // Cette route est optionnelle mais utile pour blacklister le token si besoin
    #[Route('/deconnexion', methods: ['POST'])]
    public function deconnexion(): JsonResponse
    {
        return $this->json(['message' => 'Déconnexion réussie']);
    }
}
