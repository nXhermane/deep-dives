#include <cstring>
#include <iostream>
#include <limits>

#include "LibraryFunction.h"
#include "Livre.h"
namespace BasicalLibrary {
    /**
     *  Documentation maked by Mintlify Doc Writer
     * @author Mintlify Doc Writer
     *  */

    /**
     * The function `creerUnLivre` creates a book object by taking input for its title, author, genre, and
     * publication year.
     *
     * @return The function `creerUnLivre()` is returning a variable of type `Livre`, which is a struct or
     * class containing information about a book such as title, author, genre, and publication year. The
     * function prompts the user to input these details and then returns a `Livre` object with the
     * information provided by the user.
     */
    Livre creerUnLivre() {
        Livre livre;
        const int maxChar = 200;
        livre.titre = new char[maxChar];
        livre.auteur = new char[maxChar];
        livre.genre = new char[maxChar];
        std::cin.ignore();
        std::cout << "Entrez le titre : ";
        std::cin.getline(livre.titre, maxChar);
        std::cout << "Entrez l'auteur : ";
        std::cin.getline(livre.auteur, maxChar);
        std::cout << "Entrez le genre : ";
        std::cin.getline(livre.genre, maxChar);

        while (true) {
            std::cout << "Entrez l'annee de publication : ";
            std::cin >> livre.publicationWeek;
            if (std::cin.fail()) {
                std::cout << "Veillez entrer un nombre entier." << std::endl;
                std::cin.clear();
                std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            } else
                break;
        }

        return livre;
    }

    /**
     * This C++ function `afficherUnLivre` prints out the details of a book such as title, author, genre,
     * and publication year.
     *
     * @param livre The function `afficherUnLivre` is designed to display information about a book. The
     * parameter `livre` is of type `Livre`, which seems to be a struct or class containing information
     * about a book such as its title, author, genre, and publication year.
     */
    void afficherUnLivre(const Livre &livre) {
        std::cout << "Titre                : " << livre.titre << std::endl;
        std::cout << "Auteur               : " << livre.auteur << std::endl;
        std::cout << "Genre                : " << livre.genre << std::endl;
        std::cout << "Annee de Publication : " << livre.publicationWeek << std::endl;
    }

    /**
     * The function `ajouterUnLivre` adds a new book to an array of books and returns the updated array.
     *
     * @param livre The `ajouterUnLivre` function you provided takes in a `Livre` object `livre`, an array
     * of `Livre` objects `livres`, and a reference to an integer `livresLength`. The function adds the
     * `livre` object to the `livres
     * @param livres The parameter `livres` is a pointer to an array of type `Livre`, which represents a
     * list of books.
     * @param livresLength The parameter `livresLength` represents the current length or size of the array
     * `livres` which holds a collection of `Livre` objects.
     *
     * @return This function `ajouterUnLivre` returns a pointer to an array of `Livre` objects. The
     * function takes in an existing array of `livres`, a `livre` object to add to the array, and the
     * length of the existing array. It creates a new array with one additional element, copies the
     * existing elements from the old array to the new array, adds the new
     */
    Livre *ajouterUnLivre(const Livre &livre, Livre *livres, int &livresLength) {
        Livre *newLivresList = new Livre[livresLength + 1];

        for (int i = 0; i < livresLength; i++) newLivresList[i] = livres[i];

        newLivresList[livresLength] = livre;

        livresLength++;

        delete[] livres;
        return newLivresList;
    }

    /**
     * The function `supprimerUnLivre` removes a book from a library by its title and returns the updated
     * list of books.
     *
     * @param titre The parameter `titre` is a pointer to a constant character array, which represents the
     * title of the book that you want to delete from the list of books (`livres`).
     * @param livres It looks like the code snippet you provided is a function that removes a book from a
     * list of books based on its title. The function takes the title of the book to be removed, the array
     * of books, and the length of the array as parameters.
     * @param livresLength The parameter `livresLength` represents the current length of the array `livres`
     * which holds the list of books. It is passed by reference to the function `supprimerUnLivre` so that
     * the function can update the length of the book array after removing a book. This allows the
     *
     * @return The function `supprimerUnLivre` is returning a pointer to a `Livre` object. This pointer
     * points to the new list of books after removing the book with the specified title.
     */
    Livre *supprimerUnLivre(const char *titre, Livre *livres, int &livresLength) {
        ResultatDeRecherche res = rechercherUnLivreParTitre(titre, livres, livresLength);
        if (res.livre == nullptr) {
            std::cout << "ERROR: Le livre que vous voulez supprimer n'existe pas dans votre library." << std::endl;
            return livres;
        }

        Livre *newLivreList = new Livre[livresLength - 1];

        for (int i = 0, countNewLivre = 0; i < livresLength; i++) {
            if (res.index == i) continue;
            newLivreList[countNewLivre++] = livres[i];
        }

        delete[] livres;
        livresLength--;
        return newLivreList;
    }

    /**
     * The function searches for a book by title within an array of books and returns the result.
     *
     * @param titre The parameter `titre` is a pointer to a constant character array, which represents the
     * title of the book you are searching for.
     * @param livres The function `rechercherUnLivreParTitre` is designed to search for a book by its title
     * within an array of books. However, there seems to be a logical issue in the code provided. The
     * function is currently only assigning the last book found with a matching title to the `
     * @param livresLength `livresLength` is the number of elements in the array `livres` which contains a
     * list of books.
     *
     * @return The function `rechercherUnLivreParTitre` is returning a `ResultatDeRecherche` struct. This
     * struct contains a pointer to a `Livre` object (`livre`) and an integer index (`index`).
     */
    ResultatDeRecherche rechercherUnLivreParTitre(const char *titre, Livre *livres, int &livresLength) {
        ResultatDeRecherche resultat;
        resultat.livre = nullptr;
        resultat.index = 0;
        for (int i = 0; i < livresLength; i++) {
            Livre livre = livres[i];
            if (strstr(titre, livre.titre) != nullptr) {
                resultat.livre = &livres[i];
                resultat.index = i;
            }
        }
        return resultat;
    }

    /**
     * The function searches for a book by title and displays the book if found, otherwise it outputs an
     * error message.
     *
     * @param titre The parameter `titre` in the function `rechercherUnLivre` is a pointer to a constant
     * character array (string) representing the title of the book you want to search for.
     * @param livres The parameter `livres` is likely an array of type `Livre`, which represents a
     * collection of books or book-related data. The function `rechercherUnLivre` is designed to search for
     * a book by its title within this array and display the book information if found.
     * @param livresLength The parameter `livresLength` in the function `rechercherUnLivre` is used to
     * indicate the length or number of elements in the array of `Livre` objects (`livres`). It helps in
     * determining the range of elements to search through or process within the array.
     *
     * @return The function `rechercherUnLivre` returns void, which means it does not return any value. It
     * performs a search for a book by title and then displays the book information if found, or outputs an
     * error message if the book is not found.
     */
    void rechercherUnLivre(const char *titre, Livre *livres, int &livresLength) {
        ResultatDeRecherche resultat = rechercherUnLivreParTitre(titre, livres, livresLength);
        if (resultat.livre == nullptr) {
            std::cout << "ERROR: Le livre que vous recherchez n'existe pas." << std::endl;
            return;
        }
        std::cout << "====== Voici le livre ======" << std::endl;
        afficherUnLivre(*resultat.livre);
    }

    /**
     * The confirmationFunction prompts the user with a message and returns true if the user inputs 'y'.
     *
     * @param prompt The `confirmationFunction` function takes a `const char*` parameter named `prompt`,
     * which is used to display a message or prompt to the user. The function then waits for the user to
     * input a character, and if the input character is 'y', it returns `true`, otherwise it returns
     *
     * @return The confirmationFunction returns a boolean value - true if the user input is 'y' and false
     * otherwise.
     */
    bool confirmationFunction(const char *prompt) {
        std::cout << prompt << " ";
        char confirmChar;
        std::cin >> confirmChar;
        if (confirmChar == 'y')
            return true;
        else
            return false;
    }

}  // namespace BasicalLibrary