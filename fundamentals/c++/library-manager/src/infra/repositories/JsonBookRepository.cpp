#include <algorithm>
#include <boost/json/object.hpp>
#include <iostream>
#include <iterator>
#include <stdexcept>
#include <vector>

#include "domain/entities/Book.hpp"
#include "domain/entities/Review.hpp"
#include "infra/dtos/BookPersistenceDto.hpp"
#include "infra/mappers/BookMapper.hpp"
#include "infra/repository/BookRepository.hpp"
#include "shared/infra/JsonStoreService.hpp"
#include "shared/infra/Repository.hpp"

namespace AvancedLibrary {
    JsonBookRepository::JsonBookRepository(std::string &path, Infra::Repository<ReviewProps, Review> &repo,
                                           BookMapper &bookMapper)
        : jsonStore(path, [this](Infra::JsonStoreService &jsonstore) -> void { saveToFileCallBack(jsonstore); }),
          reviewRepo(repo),
          mapper(bookMapper) {
        loadFromFile();
    }
    void JsonBookRepository::loadFromFile() {
        Infra::JsonArray bookJsonArray{jsonStore.load()};
        for (const auto &jsonBookValue : bookJsonArray) {
            if (!jsonBookValue.is_object()) throw std::runtime_error("[Error] Invalid JSON format: expected an object");
            const Infra::Json::object &jsonBook{jsonBookValue.as_object()};
            BookPersistenceDto book{BookPersistenceDto::formJson(jsonBook)};
            store.insert({book.id, book});
        }
    }
    void JsonBookRepository::saveToFileCallBack(Infra::JsonStoreService &jsonstore) {
        if (!storeChanged) return;
        Infra::JsonArray bookJsonArray;
        for (auto &book : store) {
            bookJsonArray.push_back(book.second.toJson());
        };
        std::cout << "saveToFileCallBack" << std::endl;
        jsonstore.save(bookJsonArray);
        storeChanged = false;
    }
    BookToDomainRecord JsonBookRepository::persistenceBookToRecordBook(const BookPersistenceDto &bookDto) const {
        std::vector<Review> reviews;
        std::transform(bookDto.reviewIds.begin(), bookDto.reviewIds.end(), std::back_inserter(reviews),
                       [this](auto reviewId) -> Review { return reviewRepo.getById(reviewId); });
        BookToDomainRecord bookRecord{bookDto.id,    bookDto.createdAt, bookDto.updatedAt, bookDto.isbn,
                                      bookDto.title, bookDto.author,    bookDto.year,      bookDto.status,
                                      reviews,       bookDto.categories};
        return bookRecord;
    }

    void JsonBookRepository::save(Book &book) {
        BookPersistenceDto bookDto{mapper.toPersistence(book)};
        auto it = store.find(bookDto.id);
        if (it != store.end())
            it->second = bookDto;
        else
            store[bookDto.id] = bookDto;
        storeChanged = true;
    }
    void JsonBookRepository::remove(std::string &id) {
        auto it = store.find(id);
        if (it != store.end()) {
            store.erase(id);
            storeChanged = true;
        }
    }
    Book JsonBookRepository::getById(std::string &id) const {
        auto it = store.find(id);
        if (it != store.end()) {
            return mapper.toDomain(persistenceBookToRecordBook(it->second));
        } else {
            throw std::runtime_error("The book with id " + id + " not found.");
        }
    }
    std::vector<Book> JsonBookRepository::getAll() const {
        std::vector<Book> books;
        for (auto &bookPair : store) {
            books.push_back(mapper.toDomain(persistenceBookToRecordBook(bookPair.second)));
        }
        return books;
    }

}  // namespace AvancedLibrary