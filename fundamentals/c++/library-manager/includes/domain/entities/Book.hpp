#pragma once
#include <set>
#include <vector>

#include "domain/entities/Review.hpp"
#include "shared/domain/Entity.hpp"
namespace AvancedLibrary {
    enum BookStatus { AVAILABLE, RESERVED, BORROWED, MAINTENANCE };
    struct BookProps {
        std::string isbn;
        std::string title;
        std::string author;
        unsigned int year;
        BookStatus status;
        std::vector<Review> reviews;
        std::set<std::string> categories;
    };
    class Book : public Domain::Entity<BookProps> {
       public:
        Book(Domain::CreateEntityProps<BookProps>& entityProps);
        void validate() const override;
        void addReview(Review& review);
        double getAverageRating() const;
        void addCategory(std::string category);
        void removeCategory(std::string& category);
        void updateStatus(BookStatus status);
        void changeTitle(std::string&);
        void changeAuthor(std::string&);
        void changePublishingYear(unsigned int year);
        // Getters
        const std::string& getIsbn() const;
        const std::string& getTitle() const;
        const std::string& getAuthor() const;
        unsigned int getYear() const;
        BookStatus getStatus() const;
        bool isAvailable() const;
        const std::vector<Review>& getReviews() const;
        const std::vector<std::string> getCategories() const;
    };
}  // namespace AvancedLibrary