#include <iostream>
#include <limits>

#include "BookLibrary.h"
#include "LibraryFunction.h"
#include "Livre.h"
namespace BasicalLibrary {
    /**
     *  Documentation maked by Mintlify Doc Writer
     * @author Mintlify Doc Writer
     *  */

    /**
     * The BookLibraryManager constructor initializes the bookSize variable to 0, sets the libraryBooks
     * pointer to nullptr, and calls the init function.
     */
    BookLibraryManager::BookLibraryManager() {
        bookSize = 0;
        libraryBooks = nullptr;
        init();
    }
    /**
     * The BookLibraryManager constructor initializes the bookSize and libraryBooks variables and calls the
     * init function.
     *
     * @param bookLength The `bookLength` parameter represents the number of books in the library.
     * @param livres The parameter `livres` is a pointer to an array of objects of type `Livre`. It is used
     * to initialize the `libraryBooks` member variable of the `BookLibraryManager` class.
     */
    BookLibraryManager::BookLibraryManager(const int bookLength, Livre *livres)
        : bookSize(bookLength), libraryBooks(livres) {
        init();
    }
    /**
     * The destructor `BookLibraryManager::~BookLibraryManager()` deallocates memory for each book's
     * author, title, genre, and the array of library books.
     */
    BookLibraryManager::~BookLibraryManager() {
        for (int i = 0; i < bookSize; i++) {
            delete[] libraryBooks[i].auteur;
            delete[] libraryBooks[i].titre;
            delete[] libraryBooks[i].genre;
        }
        delete[] libraryBooks;
    }

    /**
     * The function `init` in the `BookLibraryManager` class initializes the book library system and
     * presents a menu for users to add, display, search, delete books, or exit the library.
     */
    void BookLibraryManager::init() {
        bool condition = true;
        std::cout << "Bienvenue dans la bibliotheque" << std::endl;
        while (condition) {
            showMenu();
            int choice;
            while (true) {
                std::cout << "Votre choix : ";
                std::cin >> choice;
                if (std::cin.fail()) {
                    std::cout << "Entrer un nombre entier parmis ceux du menu" << std::endl;
                    std::cin.clear();
                    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
                } else
                    break;
            }

            switch (choice) {
                case 1:
                    addBook();
                    break;
                case 2:
                    showAllBook();
                    break;
                case 3:
                    searchBookByTitle();
                    break;
                case 4:
                    deleteByTitle();
                    break;
                case 5: {
                    if (confirmationFunction("Voulez-vous vraiment quitter la library ? (y/n) default(n) "))
                        condition = false;
                    else
                        continue;
                }; break;

                default:
                    std::cout << "ERROR: Unknow choice " << choice << std::endl;
            }
        }
    }
    /**
     * The function `showMenu` displays a menu with options for managing a book library.
     */
    void BookLibraryManager::showMenu() {
        std::cout << "___Menu___" << std::endl;
        std::cout << "1. Ajouter un livre" << std::endl;
        std::cout << "2. Afficher tous les livres" << std::endl;
        std::cout << "3. Rechercher un livre par titre" << std::endl;
        std::cout << "4. Supprimer un livre par titre" << std::endl;
        std::cout << "5. Quitter" << std::endl;
    }
    /**
     * The function `addBook` in the BookLibraryManager class allows a user to add a book to the library
     * after confirming the addition.
     */
    void BookLibraryManager::addBook() {
        Livre livre = creerUnLivre();
        std::cout << "Voici le livre que vous souhaitez ajouter." << std::endl;
        afficherUnLivre(livre);
        if (confirmationFunction("Voulez-vous l'ajouter(y) ou annuler(n) ? default(n) : ")) {
            libraryBooks = ajouterUnLivre(livre, libraryBooks, bookSize);
            std::cout << "Livre ajoute avec success." << std::endl;
        } else
            std::cout << "Ajout annule avec success." << std::endl;
    }

    /**
     * The function `showAllBook` displays all the books available in the library with their respective
     * details.
     *
     * @return If the condition `bookSize == 0` is true, the message "Aucun livre n'est disponible dans la
     * bibliotheque ." is printed and the function returns without further processing. If the condition is
     * false, the function iterates through the libraryBooks array and displays information about each
     * book. No specific value is being returned from this function, as it is a void function.
     */
    void BookLibraryManager::showAllBook() {
        if (bookSize == 0) {
            std::cout << "Aucun livre n'est disponible dans la bibliotheque ." << std::endl;
            return;
        }
        for (int i = 0; i < bookSize; i++) {
            const Livre book = libraryBooks[i];
            std::cout << "Livre n ̊  " << i << std::endl;
            afficherUnLivre(book);
        }
    }

    /**
     * The function `searchBookByTitle` in C++ prompts the user to enter a book title, reads the input,
     * searches for the book in a library, and then deallocates memory for the book title.
     */
    void BookLibraryManager::searchBookByTitle() {
        std::cin.ignore();
        char *bookTitle = new char[maxChar];
        std::cout << "Entrez le titre du livre que vous recherchez : ";
        std::cin.getline(bookTitle, maxChar);
        rechercherUnLivre(bookTitle, libraryBooks, bookSize);
        delete[] bookTitle;
    }

    /**
     * The function `deleteByTitle` in C++ prompts the user to enter a book title to be deleted from a
     * library, and then removes the specified book from the library collection.
     */
    void BookLibraryManager::deleteByTitle() {
        std::cin.ignore();
        char *bookTitle = new char[maxChar];
        std::cout << "Entrez le titre du livre que vous voulez supprimer : ";
        std::cin.getline(bookTitle, maxChar);
        libraryBooks = supprimerUnLivre(bookTitle, libraryBooks, bookSize);
        delete[] bookTitle;
    }
}  // namespace BasicalLibrary