#include <algorithm>
#include <string>
#include <vector>

#include "domain/entities/User.hpp"
#include "shared/core/Guard.hpp"
#include "shared/domain/Entity.hpp"
#include "shared/exceptions/Exceptions.hpp"

namespace AvancedLibrary {
    // Constant
    const unsigned User::DEFAULT_MAX_LOAN{5};
    // implementation of User entity
    User::User(Domain::CreateEntityProps<UserProps>& entityProps) : Domain::Entity<UserProps>(entityProps) {
        validate();
    }
    void User::validate() const {
        this->_isValid = false;
        if (Core::Guard::isEmpty(getProps().username).succeeded) {
            throw EmptyStringExcepiton("The username of User cannot be empty.");
        }
        if (getProps().username.size() < 3) {
            throw EmptyStringExcepiton("Le nom de l'utilisateur ne peux etre en dessous de 3 charactere.");
        }
        if (Core::Guard::isEmpty(getProps().name).succeeded) {
            throw EmptyStringExcepiton("The name of user cannot be emtpy.");
        }
        this->_isValid = true;
    }
    bool User::canBorrow() const {
        if (getProps().activeLoans.size() >= MAX_LOAN) return false;
        if (getProps().penalties != 0) return false;
        return true;
    }
    void User::addLoan(Loan& loan) {
        if (!loan.isValid()) throw new InvalidArgumentFormat("The Loan is not valid.");
        this->props.modify(&UserProps::activeLoans,
                           [&loan](std::vector<Loan>& activeLoans) -> void { activeLoans.push_back(loan); });
        validate();
    }
    void User::addPenalty(double amout) { this->props.set(&UserProps::penalties, amout + props.get().penalties); }
    void User::payPenalty(double amount) {
        if (Core::Guard::isNegative(amount).succeeded) {
            throw NegativeValueException("The amount of penalty must be positive value");
        }
        const double diffPenalty = props.get().penalties - amount;
        props.set(&UserProps::penalties, Core::Guard::isNegative(diffPenalty).succeeded ? 0.0 : diffPenalty);
    }
    double User::getPenalties() const { return getProps().penalties; }
    const std::vector<Loan>& User::getActiveLoans() const { return props.get().activeLoans; }
    const std::vector<Loan>& User::getLoanHistory() const { return props.get().loanHistory; }
}  // namespace AvancedLibrary