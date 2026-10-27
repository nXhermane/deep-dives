#include <algorithm>
#include <boost/json/fwd.hpp>
#include <boost/json/object.hpp>
#include <set>

#include "domain/entities/Book.hpp"
#include "infra/dtos/BookPersistenceDto.hpp"
#include "infra/mappers/BookMapper.hpp"
#include "shared/domain/Entity.hpp"
#include "shared/utils/time_utils.hpp"
namespace AvancedLibrary {
    BookMapper::BookMapper() {}
    BookPersistenceDto BookMapper::toPersistence(const Book& book) const {
        BookPersistenceDto bookDto{book.getId(),   book.getCreatedAt(), book.getUpdatedAt(),
                                   book.getIsbn(), book.getTitle(),     book.getAuthor(),
                                   book.getYear(), book.getStatus(),    book.getCategories()};
        auto reviews{book.getReviews()};
        bookDto.reviewIds.reserve(reviews.size());
        std::transform(reviews.begin(), reviews.end(), bookDto.reviewIds.begin(),
                       [](const Review& review) { return review.getId(); });
        return bookDto;
    };

    Book BookMapper::toDomain(const BookToDomainRecord& bookRecord) const {
        Domain::CreateEntityProps<BookProps> entityProps{
            bookRecord.id, Utils::stringToTimePoint(bookRecord.createdAt),
            Utils::stringToTimePoint(bookRecord.updatedAt),
            BookProps{bookRecord.isbn, bookRecord.title, bookRecord.author, bookRecord.year, bookRecord.status,
                      bookRecord.reviews,
                      std::set<std::string>{bookRecord.categories.begin(), bookRecord.categories.end()}}};

        return Book{entityProps};
    };
   
 
}  // namespace AvancedLibrary