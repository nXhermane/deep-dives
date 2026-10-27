#pragma once
#include <chrono>
#include <string>

#include "shared/domain/Entity.hpp"
namespace AvancedLibrary {
    struct ReviewProps {
        unsigned rating;
        std::string comment;
        bool modified;
        std::chrono::time_point<std::chrono::system_clock> date;
        std::string userId;
    };

    class Review : public Domain::Entity<ReviewProps> {
       public:
        Review(Domain::CreateEntityProps<ReviewProps>& reviewProps);
        Review(const Review &) = default;
        void validate() const override;
        void update(unsigned rating, std::string& comment);
        bool canModify() const;
       Review & operator=(const Review&) = default;
        // Static value
        static const unsigned minRating{1};
        static const unsigned maxRating{5};
    };
}  // namespace AvancedLibrary