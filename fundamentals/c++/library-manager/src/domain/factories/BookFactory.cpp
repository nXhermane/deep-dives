#include <optional>

#include "shared/domain/Entity.hpp"
#include "shared/core/Result.hpp"
#include "domain/entities/Book.hpp"
#include "domain/entities/Review.hpp"
#include "domain/factories/BookFactory.hpp"

namespace AvancedLibrary {
    BookFactory::BookFactory(){};
    Core::Result<Book> BookFactory::create(CreateBookProps& createProps) {
        return Core::Result<Book>::encapsultate<Book>([&createProps]() -> Book {
            Domain::CreateEntityProps<BookProps> entityProps{
                std::nullopt,
                std::nullopt,
                std::nullopt,
                {createProps.isbn, createProps.title, createProps.author, createProps.year, BookStatus::AVAILABLE,
                 std::vector<Review>{}, createProps.categories}};
            return Book{entityProps};
        });
    }
}  // namespace AvancedLibrary