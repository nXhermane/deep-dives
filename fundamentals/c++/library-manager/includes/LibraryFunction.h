#pragma once
#include "Livre.h"
namespace BasicalLibrary {
Livre creerUnLivre();
Livre *ajouterUnLivre(const Livre &livre, Livre *livres, int &livresLength);
Livre *supprimerUnLivre(const char *titre, Livre *livres, int &livresLength);
void afficherUnLivre(const Livre &livre);
void rechercherUnLivre(const char *titre, Livre *livres, int &livresLength);

struct ResultatDeRecherche {
        Livre *livre;
        int index;
};

ResultatDeRecherche rechercherUnLivreParTitre(const char *titre, Livre *livres, int &livresLength);
bool confirmationFunction(const char *prompt);

}  // namespace BasicalLibrary
