#pragma once

#include "domain/entities/Review.hpp"
#include "infra/dtos/ReviewPersistenceDto.hpp"
#include "shared/infra/InfraMapper.hpp"
namespace AvancedLibrary {

    class ReviewMapper : public Infra::InfraMapper<ReviewProps, Review, ReviewPersistenceDto> {
       public:
        ReviewMapper();
        ReviewPersistenceDto toPersistence(const Review &) const override;
        Review toDomain(const ReviewPersistenceDto &) const;
    };
}  // namespace AvancedLibrary