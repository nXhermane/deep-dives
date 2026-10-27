#pragma once

#include "domain/entities/Loan.hpp"
#include "infra/dtos/LoanPersistenceDto.hpp"
#include "shared/infra/InfraMapper.hpp"
namespace AvancedLibrary {

    class LoanMapper : public Infra::InfraMapper<LoanProps, Loan, LoanPersistenceDto> {
       public:
        LoanMapper();
        LoanPersistenceDto toPersistence(const Loan &) const override;
        Loan toDomain(const LoanPersistenceDto &) const;

        
    };
}  // namespace AvancedLibrary