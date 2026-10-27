#include <chrono>

#include "domain/entities/Loan.hpp"
#include "shared/core/Guard.hpp"
#include "shared/domain/Entity.hpp"

namespace AvancedLibrary {
    Loan::Loan(Domain::CreateEntityProps<LoanProps>& entityProps) : Domain::Entity<LoanProps>(entityProps) {
        if (!getProps().startDate.has_value())
            props.modify(&LoanProps::startDate,
                         [](std::optional<std::chrono::time_point<std::chrono::system_clock>>& startDate) -> void {
                             startDate = std::chrono::system_clock::now();
                         });
        // La durée maximum d'emprunt est de 21 jours.
        props.modify(&LoanProps::dueDate,
                     [this](std::optional<std::chrono::time_point<std::chrono::system_clock>>& dueDate) -> void {
                         dueDate = this->getProps().startDate.value() + std::chrono::hours(24 * 21);
                     });
        props.set(&LoanProps::status, LoanStatus::ACTIVED);

        validate();
    }
    void Loan::validate() const {
        this->_isValid = false;
        if (Core::Guard::isEmpty(getProps().bookId).succeeded) {
            throw std::runtime_error("Livre invalide : null");
        }
        if (!getProps().startDate.has_value() || !getProps().dueDate.has_value()) {
            throw std::runtime_error("Dates d'emprunt non initialisées");
        }
        if (getProps().dueDate.value() <= getProps().startDate.value()) {
            throw std::runtime_error("La date d'échéance doit être postérieure à la date de début");
        }
        this->_isValid = true;
    }

    void Loan::returnBook() {
        this->props.modify(&LoanProps::returnDate,
                           [](std::optional<std::chrono::time_point<std::chrono::system_clock>>& returnDate) -> void {
                               returnDate = std::chrono::system_clock::now();
                           });
        this->props.set(&LoanProps::status, LoanStatus::RETURNED);
    }
    bool Loan::extend() {
        if (getProps().status != LoanStatus::ACTIVED) {
            return false;
        }
        if (getProps().status == LoanStatus::EXTENDED) {
            return false;
        }
        this->props.set(&LoanProps::status, LoanStatus::EXTENDED);
        if (!getProps().dueDate.has_value()) {
            return false;
        }
        this->props.modify(&LoanProps::dueDate,
                           [](std::optional<std::chrono::time_point<std::chrono::system_clock>>& dueDate) -> void {
                               dueDate = dueDate.value() + std::chrono::hours(24 * 7);
                           });
        return true;
    }
    bool Loan::overDue() {
        if (getProps().status != LoanStatus::ACTIVED) {
            return false;
        }
        if (std::chrono::system_clock::now() > getProps().dueDate.value()) {
            this->props.set(&LoanProps::status, LoanStatus::OVERDUE);
            return true;
        }
        return false;
    }
    double Loan::calculatePenalty() {
        if (!getProps().dueDate.has_value() || !getProps().returnDate.has_value()) {
            return 0.0;
        }
        // Calcul du délai en heures.
        long delay =
            std::chrono::duration_cast<std::chrono::hours>(getProps().returnDate.value() - getProps().dueDate.value())
                .count();
        if (delay > 0) {
            // Conversion en jours (24 heures par jour).
            double daysDelayed = delay / 24.0;
            return daysDelayed * 1.0;  // 1 euro par jour
        }
        return 0.0;
    }

}  // namespace AvancedLibrary