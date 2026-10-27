#pragma once
#include "shared/domain/Factory.hpp"
#include "shared/core/Result.hpp"
#include "domain/entities/Book.hpp"

namespace AvancedLibrary {
    struct CreateBookProps {
        std::string isbn;
        std::string title;
        std::string author;
        unsigned year;
        std::set<std::string> categories;
    };
    class BookFactory : public Core::Factory<BookProps,Book, CreateBookProps> {
       public:
        BookFactory();
        Core::Result<Book> create(CreateBookProps&) override;
    };
}  // namespace AvancedLibrary