#include "domain/entities/Review.hpp"
#include "infra/mappers/ReviewMapper.hpp"
#include "shared/domain/Entity.hpp"
#include "shared/utils/time_utils.hpp"

namespace AvancedLibrary {
    ReviewMapper::ReviewMapper() {}

    ReviewPersistenceDto ReviewMapper::toPersistence(const Review& review) const {
        ReviewPersistenceDto reviewDto{review.getId(),
                                       review.getCreatedAt(),
                                       review.getUpdatedAt(),
                                       review.getProps().comment,
                                       review.getProps().rating,
                                       review.getProps().modified,
                                       Utils::timePointToString(review.getProps().date),
                                       review.getProps().userId};
        return reviewDto;
    }

    Review ReviewMapper::toDomain(const ReviewPersistenceDto& reviewDto) const {
        Domain::CreateEntityProps<ReviewProps> entityProps{
            reviewDto.id, Utils::stringToTimePoint(reviewDto.createdAt), Utils::stringToTimePoint(reviewDto.updatedAt),
            ReviewProps{reviewDto.rating, reviewDto.comment, reviewDto.modified,
                        Utils::stringToTimePoint(reviewDto.date), reviewDto.userId}};
        return Review{entityProps};
    }
}  // namespace AvancedLibrary