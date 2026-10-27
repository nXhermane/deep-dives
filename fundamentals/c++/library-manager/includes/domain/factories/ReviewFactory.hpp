#pragma once
#include <string>

#include "domain/entities/Review.hpp"
#include "shared/core/Result.hpp"
#include "shared/domain/Factory.hpp"
namespace AvancedLibrary {
    struct CreateReviewProps {
        unsigned rating;
        std::string comment;
        std::string userId;
    };
    class ReviewFactory : public Core::Factory<ReviewProps, Review, CreateReviewProps> {
       public:
        ReviewFactory();
        Core::Result<Review> create(CreateReviewProps&) override;
    };
}  // namespace AvancedLibrary