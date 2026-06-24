from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from users.models import MechanicProfile

User = get_user_model()

DEFAULT_PASSWORD = "Mechanic123!"

MECHANICS = [
    {
        "email": "rakoto.antananarivo@prestataire-mg.fr",
        "username": "rakoto_tana",
        "first_name": "Rakoto",
        "last_name": "Andrianina",
        "phone": "+261 34 12 345 01",
        "business_name": "Garage Rakoto Auto",
        "bio": "Spécialiste en diagnostic moteur et entretien général à Antananarivo depuis 12 ans.",
        "specialties": "moteur, vidange, diagnostic",
        "address": "Lot II M 45 Analakely",
        "city": "Antananarivo",
        "postal_code": "101",
        "latitude": Decimal("-18.913600"),
        "longitude": Decimal("47.526100"),
        "hourly_rate": Decimal("25000.00"),
        "years_experience": 12,
        "average_rating": Decimal("4.80"),
        "total_reviews": 24,
    },
    {
        "email": "haja.toamasina@prestataire-mg.fr",
        "username": "haja_tamatave",
        "first_name": "Haja",
        "last_name": "Rasolofo",
        "phone": "+261 34 12 345 02",
        "business_name": "Méca Express Tamatave",
        "bio": "Interventions rapides sur le littoral est : freinage, climatisation et préparation voyage.",
        "specialties": "freinage, climatisation, pneus",
        "address": "Boulevard Joffre",
        "city": "Toamasina",
        "postal_code": "501",
        "latitude": Decimal("-18.149200"),
        "longitude": Decimal("49.402300"),
        "hourly_rate": Decimal("22000.00"),
        "years_experience": 9,
        "average_rating": Decimal("4.60"),
        "total_reviews": 18,
    },
    {
        "email": "nirina.antsirabe@prestataire-mg.fr",
        "username": "nirina_antsirabe",
        "first_name": "Nirina",
        "last_name": "Razafy",
        "phone": "+261 34 12 345 03",
        "business_name": "Atelier Nirina Mécanique",
        "bio": "Réparation transmission et suspension pour véhicules légers et utilitaires à Antsirabe.",
        "specialties": "transmission, suspension, embrayage",
        "address": "Avenue de la Gare",
        "city": "Antsirabe",
        "postal_code": "110",
        "latitude": Decimal("-19.873000"),
        "longitude": Decimal("47.033300"),
        "hourly_rate": Decimal("20000.00"),
        "years_experience": 15,
        "average_rating": Decimal("4.90"),
        "total_reviews": 31,
    },
    {
        "email": "fidy.mahajanga@prestataire-mg.fr",
        "username": "fidy_majunga",
        "first_name": "Fidy",
        "last_name": "Randrianarisoa",
        "phone": "+261 34 12 345 04",
        "business_name": "Auto Service Majunga",
        "bio": "Garage familial à Mahajanga, expert en électricité auto et batteries.",
        "specialties": "électricité, batterie, démarrage",
        "address": "Rue du Commerce",
        "city": "Mahajanga",
        "postal_code": "401",
        "latitude": Decimal("-15.716700"),
        "longitude": Decimal("46.316700"),
        "hourly_rate": Decimal("21000.00"),
        "years_experience": 8,
        "average_rating": Decimal("4.50"),
        "total_reviews": 12,
    },
    {
        "email": "soa.fianarantsoa@prestataire-mg.fr",
        "username": "soa_fianar",
        "first_name": "Soa",
        "last_name": "Ramanantsoa",
        "phone": "+261 34 12 345 05",
        "business_name": "Garage Haute-Ville Soa",
        "bio": "Mécanique générale et révision complète pour particuliers à Fianarantsoa.",
        "specialties": "révision, moteur, filtres",
        "address": "Rue Ratsimahefa",
        "city": "Fianarantsoa",
        "postal_code": "301",
        "latitude": Decimal("-21.452700"),
        "longitude": Decimal("47.085800"),
        "hourly_rate": Decimal("19000.00"),
        "years_experience": 10,
        "average_rating": Decimal("4.70"),
        "total_reviews": 15,
    },
    {
        "email": "tiana.toliara@prestataire-mg.fr",
        "username": "tiana_tulear",
        "first_name": "Tiana",
        "last_name": "Rakotobe",
        "phone": "+261 34 12 345 06",
        "business_name": "Méca Sud Toliara",
        "bio": "Spécialiste 4x4 et véhicules tout-terrain dans le grand sud malgache.",
        "specialties": "4x4, pneus, direction",
        "address": "Route de Saint-Augustin",
        "city": "Toliara",
        "postal_code": "601",
        "latitude": Decimal("-23.351600"),
        "longitude": Decimal("43.685500"),
        "hourly_rate": Decimal("23000.00"),
        "years_experience": 11,
        "average_rating": Decimal("4.40"),
        "total_reviews": 9,
    },
    {
        "email": "miora.antsiranana@prestataire-mg.fr",
        "username": "miora_diego",
        "first_name": "Miora",
        "last_name": "Rajoelina",
        "phone": "+261 34 12 345 07",
        "business_name": "Diego Auto Pro",
        "bio": "Entretien et réparation rapide à Antsiranana, service véhicules de tourisme.",
        "specialties": "vidange, freinage, carrosserie légère",
        "address": "Avenue de l'Indépendance",
        "city": "Antsiranana",
        "postal_code": "201",
        "latitude": Decimal("-12.276800"),
        "longitude": Decimal("49.291500"),
        "hourly_rate": Decimal("24000.00"),
        "years_experience": 7,
        "average_rating": Decimal("4.65"),
        "total_reviews": 11,
    },
    {
        "email": "andri.ampefiloha@prestataire-mg.fr",
        "username": "andri_ampefiloha",
        "first_name": "Andri",
        "last_name": "Rasamimanana",
        "phone": "+261 34 12 345 08",
        "business_name": "Garage Ampefiloha Motors",
        "bio": "Réparation rapide et dépannage à domicile dans le quartier Ampefiloha.",
        "specialties": "dépannage, batterie, pneus",
        "address": "Rue du 26 Juin, Ampefiloha",
        "city": "Antananarivo",
        "postal_code": "101",
        "latitude": Decimal("-18.910300"),
        "longitude": Decimal("47.535400"),
        "hourly_rate": Decimal("24000.00"),
        "years_experience": 6,
        "average_rating": Decimal("4.55"),
        "total_reviews": 8,
    },
    {
        "email": "zo.ivandry@prestataire-mg.fr",
        "username": "zo_ivandry",
        "first_name": "Zo",
        "last_name": "Raharison",
        "phone": "+261 34 12 345 09",
        "business_name": "Méca Ivandry Premium",
        "bio": "Atelier moderne à Ivandry, spécialisé climatisation et électronique embarquée.",
        "specialties": "climatisation, électronique, diagnostic",
        "address": "Zone Galaxy, Ivandry",
        "city": "Antananarivo",
        "postal_code": "101",
        "latitude": Decimal("-18.887200"),
        "longitude": Decimal("47.558900"),
        "hourly_rate": Decimal("28000.00"),
        "years_experience": 10,
        "average_rating": Decimal("4.85"),
        "total_reviews": 20,
    },
    {
        "email": "tahina.ambohijatovo@prestataire-mg.fr",
        "username": "tahina_ambohijatovo",
        "first_name": "Tahina",
        "last_name": "Randriamampionona",
        "phone": "+261 34 12 345 10",
        "business_name": "Auto Ambohijatovo",
        "bio": "Entretien courant et révision à Ambohijatovo, service particuliers et taxis.",
        "specialties": "vidange, freinage, révision",
        "address": "Rue Rainandriamampandry, Ambohijatovo",
        "city": "Antananarivo",
        "postal_code": "101",
        "latitude": Decimal("-18.920100"),
        "longitude": Decimal("47.512300"),
        "hourly_rate": Decimal("21000.00"),
        "years_experience": 14,
        "average_rating": Decimal("4.75"),
        "total_reviews": 27,
    },
    {
        "email": "lala.behoririka@prestataire-mg.fr",
        "username": "lala_behoririka",
        "first_name": "Lala",
        "last_name": "Rakotondrazaka",
        "phone": "+261 34 12 345 11",
        "business_name": "Garage Behoririka Express",
        "bio": "Petit garage de quartier à Behoririka, réparations moteur et transmission.",
        "specialties": "moteur, transmission, embrayage",
        "address": "Avenue Behoririka",
        "city": "Antananarivo",
        "postal_code": "101",
        "latitude": Decimal("-18.905000"),
        "longitude": Decimal("47.518000"),
        "hourly_rate": Decimal("20000.00"),
        "years_experience": 11,
        "average_rating": Decimal("4.35"),
        "total_reviews": 14,
    },
    {
        "email": "patrick.ankorondrano@prestataire-mg.fr",
        "username": "patrick_ankorondrano",
        "first_name": "Patrick",
        "last_name": "Ramanana",
        "phone": "+261 34 12 345 12",
        "business_name": "Ankorondrano Auto Service",
        "bio": "Service complet à Ankorondrano : carrosserie légère, peinture et mécanique.",
        "specialties": "carrosserie, peinture, mécanique générale",
        "address": "Rue d'Ankorondrano",
        "city": "Antananarivo",
        "postal_code": "101",
        "latitude": Decimal("-18.898100"),
        "longitude": Decimal("47.547800"),
        "hourly_rate": Decimal("26000.00"),
        "years_experience": 13,
        "average_rating": Decimal("4.70"),
        "total_reviews": 19,
    },
    {
        "email": "mamy.andraharo@prestataire-mg.fr",
        "username": "mamy_andraharo",
        "first_name": "Mamy",
        "last_name": "Razafindrakoto",
        "phone": "+261 34 12 345 13",
        "business_name": "Méca Andraharo",
        "bio": "Interventions express à Andraharo, idéal pour les urgences en centre-ville.",
        "specialties": "dépannage, freinage, direction",
        "address": "Rue Andraharo",
        "city": "Antananarivo",
        "postal_code": "101",
        "latitude": Decimal("-18.898900"),
        "longitude": Decimal("47.522800"),
        "hourly_rate": Decimal("23000.00"),
        "years_experience": 9,
        "average_rating": Decimal("4.60"),
        "total_reviews": 16,
    },
]


class Command(BaseCommand):
    help = "Crée des mécaniciens de démonstration à différentes localisations à Madagascar."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default=DEFAULT_PASSWORD,
            help=f"Mot de passe pour tous les comptes (défaut: {DEFAULT_PASSWORD})",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Supprime et recrée les mécaniciens de démonstration Madagascar.",
        )

    def handle(self, *args, **options):
        password = options["password"]
        reset = options["reset"]
        created = 0
        updated = 0
        skipped = 0

        for data in MECHANICS:
            email = data["email"]
            user = User.objects.filter(email=email).first()

            if user and reset:
                MechanicProfile.objects.filter(user=user).delete()
                user.delete()
                user = None

            profile_fields = {
                "business_name": data["business_name"],
                "bio": data["bio"],
                "specialties": data["specialties"],
                "address": data["address"],
                "city": data["city"],
                "postal_code": data["postal_code"],
                "latitude": data["latitude"],
                "longitude": data["longitude"],
                "hourly_rate": data["hourly_rate"],
                "years_experience": data["years_experience"],
                "is_verified": True,
                "is_available": True,
                "average_rating": data["average_rating"],
                "total_reviews": data["total_reviews"],
            }

            if user:
                user.first_name = data["first_name"]
                user.last_name = data["last_name"]
                user.phone = data["phone"]
                user.role = User.Role.MECANICIEN
                user.is_active = True
                user.set_password(password)
                user.save()

                profile, _ = MechanicProfile.objects.update_or_create(
                    user=user,
                    defaults=profile_fields,
                )
                updated += 1
                self.stdout.write(self.style.WARNING(f"Mis à jour: {email} ({data['city']})"))
                continue

            user = User.objects.create_user(
                email=email,
                username=data["username"],
                password=password,
                first_name=data["first_name"],
                last_name=data["last_name"],
                phone=data["phone"],
                role=User.Role.MECANICIEN,
            )
            MechanicProfile.objects.create(user=user, **profile_fields)
            created += 1
            self.stdout.write(self.style.SUCCESS(f"Créé: {email} ({data['city']})"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Terminé — créés: {created}, mis à jour: {updated}, ignorés: {skipped}"))
        self.stdout.write(self.style.NOTICE(f"Mot de passe commun: {password}"))