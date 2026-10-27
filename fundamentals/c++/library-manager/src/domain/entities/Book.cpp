#include <numeric>
#include <stdexcept>
#include <string>
#include <vector>

#include "domain/entities/Book.hpp"
#include "shared/domain/Entity.hpp"
#include "shared/exceptions/Exceptions.hpp"
#include "shared/core/Guard.hpp"
#include "domain/entities/Review.hpp"
namespace AvancedLibrary {
    // constructor
    Book::Book(Domain::CreateEntityProps<BookProps>& entityProps) : Domain::Entity<BookProps>(entityProps) {
        validate();
    }

    void Book::validate() const {
        this->_isValid = false;
        if (Core::Guard::isEmpty(getProps().isbn).succeeded) {
            throw EmptyStringExcepiton("The isbn of Book cannot be empty.");
        }
        if (Core::Guard::isEmpty(getProps().author).succeeded) {
            throw EmptyStringExcepiton("The book author name cannot be emty.");
        }
        if (Core::Guard::isEmpty(getProps().title).succeeded) {
            throw EmptyStringExcepiton("The book title cannot be empty.");
        }
        this->_isValid = true;
    }

    void Book::changeTitle(std::string& title) { this->props.set(&BookProps::title, title); }
    void Book::changeAuthor(std::string& author) { this->props.set(&BookProps::author, author); }
    void Book::changePublishingYear(unsigned int year) { this->props.set(&BookProps::year, year); }
    void Book::addCategory(std::string category) {
        this->props.modify(&BookProps::categories,
                           [&category](std::set<std::string>& categories) -> void { categories.insert(category); });
    }
    void Book::addReview(Review& review) {
        Domain::Entity<ReviewProps>::GetPropsResult reviewProps = review.getProps();
        std::vector<Review> const reviews = this->getProps().reviews;
        for (const Review it : reviews) {
            if (it.getProps().userId == reviewProps.userId)
                throw std::runtime_error("The user must be added just one review per book");
        }
        this->props.modify(&BookProps::reviews,
                           [&review](std::vector<Review>& reviews) -> void { reviews.push_back(review); });
    }
    void Book::updateStatus(BookStatus status) { this->props.set(&BookProps::status, status); }
    void Book::removeCategory(std::string& category) {
        this->props.modify(&BookProps::categories,
                           [&category](std::set<std::string>& categories) -> void { categories.erase(category); });
    }
    double Book::getAverageRating() const {
        std::vector<Review> const reviews = this->props.get().reviews;
        double sum = std::accumulate(reviews.begin(), reviews.end(), 0, [](double acc, Review const& review) -> double {
            return review.getProps().rating + acc;
        });
        return sum / reviews.size();
    }
    const std::string& Book::getAuthor() const { return this->props.get().author; }
    const std::string& Book::getTitle() const { return this->props.get().title; }
    const std::string& Book::getIsbn() const { return this->props.get().isbn; }
    unsigned int Book::getYear() const { return this->props.get().year; }
    BookStatus Book::getStatus() const { return this->props.get().status; }
    const std::vector<Review>& Book::getReviews() const { return this->props.get().reviews; }
    const std::vector<std::string> Book::getCategories() const {
        return std::vector<std::string>{this->props.get().categories.begin(), this->props.get().categories.end()};
    }
    bool Book::isAvailable() const { return this->props.get().status == BookStatus::AVAILABLE; }

}  // namespace AvancedLibrary