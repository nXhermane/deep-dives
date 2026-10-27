#pragma once
#include <boost/json/object.hpp>
#include <string>
#include <vector>

#include "domain/entities/Book.hpp"
#include "domain/entities/Review.hpp"
#include "infra/dtos/BookPersistenceDto.hpp"
#include "shared/infra/InfraMapper.hpp"

namespace AvancedLibrary {
 
    struct BookToDomainRecord {
        std::string id;
        std::string createdAt;
        std::string updatedAt;
        std::string isbn;
        std::string title;
        std::string author;
        unsigned year;
        BookStatus status;
        std::vector<Review> reviews;
        std::vector<std::string> categories;
    };

    class BookMapper : public Infra::InfraMapper<BookProps, Book, BookPersistenceDto> {
       public:
        BookMapper();
        BookPersistenceDto toPersistence(const Book &) const override;
        Book toDomain(const BookToDomainRecord &) const;
    };
}  // namespace AvancedLibrary