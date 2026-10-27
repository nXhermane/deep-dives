#pragma once
#include <string>

#include "shared/domain/ValueObject.hpp"

namespace AvancedLibrary {
    class Email : public Domain::ValueObject<std::string> {
       public:
        explicit Email(std::string& email);
        void validate(const Domain::ValueObjectProps<std::string>& props) const override;
        static bool isValidEmail(const std::string& email);
    };

}  // namespace AvancedLibrary
