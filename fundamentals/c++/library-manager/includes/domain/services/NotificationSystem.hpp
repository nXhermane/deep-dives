#include <memory>
#include <unordered_map>

#include "Entity.hpp"
#include "Loan.hpp"
#include "Reservation.hpp"
namespace AvancedLibrary {
    class NotificationSystem {
        std::unordered_map<Domain::AggregateID, std::shared_ptr<User>> users;

       public:
        NotificationSystem() = default;
        void notifyOverdueLoans() const;
        void notifyAvailableReservation(const Reservation& reservation) const;
        void notifyUpcomingLoan(const Loan& loan) const;
    };
}  // namespace AvancedLibrary