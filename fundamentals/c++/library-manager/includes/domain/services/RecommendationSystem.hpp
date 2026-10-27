#include <memory>
#include <unordered_map>
#include <vector>

#include "Book.hpp"
#include "Entity.hpp"
namespace AvancedLibrary {
    class RecommendationSytem {
       private:
        std::unordered_map<Domain::AggregateID, std::shared_ptr<Book>> books;

       public:
        RecommendationSytem(std::unordered_map<Domain::AggregateID, std::shared_ptr<Book>>& books);
        ;
        std::vector<std::shared_ptr<Book>> getRecommendations(const std::shared_ptr<User>&) const;
        std::vector<std::shared_ptr<Book>> getPopularBooks() const;
        std::vector<std::shared_ptr<Book>> getSimilarBooks() const;
    };
}  // namespace AvancedLibrary