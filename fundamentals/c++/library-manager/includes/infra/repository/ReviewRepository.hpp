#pragma once

#include <string>

#include "domain/entities/Review.hpp"
#include "shared/infra/Repository.hpp"
namespace AvancedLibrary {
    class ReviewRepository : public Infra::Repository<ReviewProps, Review> {
       public:
        ReviewRepository();

        void save(Review &) override;
        void remove(std::string &) override;
        Review getById(std::string &) const override;
        std::vector<Review> getAll() const override;
    };
}  // namespace AvancedLibrary