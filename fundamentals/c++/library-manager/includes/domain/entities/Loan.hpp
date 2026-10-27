#pragma once

#include <chrono>
#include <optional>

#include "shared/domain/Entity.hpp"
namespace AvancedLibrary {
    enum LoanStatus { ACTIVED, RETURNED, OVERDUE, EXTENDED };
    struct LoanProps {
        std::optional<std::chrono::time_point<std::chrono::system_clock>> startDate;
        std::optional<std::chrono::time_point<std::chrono::system_clock>> dueDate;
        std::optional<std::chrono::time_point<std::chrono::system_clock>> returnDate;
        LoanStatus status;
        std::string bookId;
    };
    class Loan : public Domain::Entity<LoanProps> {
       public:
        Loan(Domain::CreateEntityProps<LoanProps>& entityProps);
        void validate() const override;
        bool extend();
        void returnBook();
        bool overDue();
        double calculatePenalty();
    };
}  // namespace AvancedLibrary