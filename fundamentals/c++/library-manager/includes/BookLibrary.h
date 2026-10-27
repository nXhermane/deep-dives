#pragma once
#include "Livre.h"
namespace BasicalLibrary {
class BookLibraryManager {
 public:
  const int maxChar = 200;

 private:
  int bookSize;
  Livre *libraryBooks;

 public:
  BookLibraryManager();
  BookLibraryManager(const int bookLength, Livre *livres);

 private:
  void init();
  void showMenu();
  void addBook();
  void showAllBook();
  void searchBookByTitle();
  void deleteByTitle();

 public:
  ~BookLibraryManager();
};
}  // namespace BasicalLibrary
