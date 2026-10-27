#include <chrono>

#include "domain/entities/Review.hpp"
#include "domain/factories/ReviewFactory.hpp"
#include "shared/core/Result.hpp"
#include "shared/domain/Entity.hpp"
namespace AvancedLibrary {
    ReviewFactory::ReviewFactory() {}
    Core::Result<Review> ReviewFactory::create(CreateReviewProps& createProps) {
        return Core::Result<Review>::encapsultate<Review>([&createProps]() -> Review {
            Domain::CreateEntityProps<ReviewProps> entityProps{
                std::nullopt, std::nullopt, std::nullopt,
                ReviewProps{createProps.rating, createProps.comment, false, std::chrono::system_clock::now(),
                            createProps.userId}};
            return Review{entityProps};
        });
    }
}  // namespace AvancedLibrary