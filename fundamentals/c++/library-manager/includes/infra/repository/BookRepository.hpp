#pragma once
#include <string>
#include <unordered_map>
#include <vector>

#include "domain/entities/Book.hpp"
#include "domain/entities/Review.hpp"
#include "infra/dtos/BookPersistenceDto.hpp"
#include "infra/mappers/BookMapper.hpp"
#include "shared/infra/JsonStoreService.hpp"
#include "shared/infra/Repository.hpp"
namespace AvancedLibrary {
    class BookRepository : public Infra::Repository<BookProps, Book> {
       public:
        BookRepository();

        void save(Book &) override;
        void remove(std::string &id) override;
        Book getById(std::string &id) const override;
        std::vector<Book> getAll() const override;
    };
    class JsonBookRepository : public Infra::Repository<BookProps, Book> {
       private:
        bool storeChanged{false};
        Infra::Repository<ReviewProps, Review> &reviewRepo;
        std::unordered_map<std::string, BookPersistenceDto> store;
        Infra::JsonStoreService jsonStore;
        BookMapper &mapper;
        void loadFromFile();
        // void saveToFile();
        void saveToFileCallBack(Infra::JsonStoreService &jsonstore);
        BookToDomainRecord persistenceBookToRecordBook(const BookPersistenceDto &) const;

       public:
        JsonBookRepository(std::string &, Infra::Repository<ReviewProps, Review> &, BookMapper &);

        void save(Book &) override;
        void remove(std::string &id) override;
        Book getById(std::string &id) const override;
        std::vector<Book> getAll() const override;
    };
}  // namespace AvancedLibrary