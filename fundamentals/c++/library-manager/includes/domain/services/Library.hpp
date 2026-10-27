#pragma once

#include <memory>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

#include "Book.hpp"
#include "Entity.hpp"
#include "Loan.hpp"
#include "NotificationSystem.hpp"
#include "Reservation.hpp"
#include "User.hpp"
namespace AvancedLibrary {
    class Library {
       private:
        std::unordered_map<Domain::AggregateID, std::shared_ptr<Book>> books;
        std::unordered_map<Domain::AggregateID, std::shared_ptr<User>> users;
        std::vector<Loan> activeLoans;
        std::vector<Reservation> activeReservations;

       public:
        Library(std::optional<std::vector<Book>>&, std::optional<std::vector<User>>&, std::optional<std::vector<Loan>>&,
                std::optional<std::vector<Reservation>>&);
        void addBook(Book& book);
        void removeBook(const Domain::AggregateID& id);
        std::optional<std::shared_ptr<Book>> findBookByIsbn(const std::string& ibsn) const;
        std::vector<std::shared_ptr<Book>> findBookByAuthor(const std::string& author) const;
        std::vector<std::shared_ptr<Book>> findBookByCategory(const std::string& category) const;
        void processLoan(std::shared_ptr<User> user, std::shared_ptr<Book> book);
        void returnLoan(Loan& loan);
        void addReservation(std::shared_ptr<User> user, std::shared_ptr<Book>);

        // Getters
        const std::vector<std::shared_ptr<Book>> getBooks() const;
        const std::vector<std::shared_ptr<User>> getUsers() const;
        const std::vector<Loan> getActiveLoans() const;
        const std::vector<Reservation> getActiveReservations() const;
    };
}  // namespace AvancedLibrary