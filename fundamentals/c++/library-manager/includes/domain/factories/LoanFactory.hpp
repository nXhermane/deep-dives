#pragma once
#include <string>

#include "shared/core/Result.hpp"
#include "domain/entities/Loan.hpp"
#include "shared/domain/Factory.hpp"
namespace AvancedLibrary {
    struct CreateLoanProps {
        std::string bookId;
    };
    class LoanFactory : public Core::Factory<LoanProps, Loan, CreateLoanProps> {
       public:
        LoanFactory();
        Core::Result<Loan> create(CreateLoanProps&) override;
    };
}  // namespace AvancedLibrary