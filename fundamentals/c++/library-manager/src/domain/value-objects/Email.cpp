#include <format>
#include <regex>
#include <string>

#include "domain/value-objects/Email.hpp"
#include "shared/exceptions/Exceptions.hpp"
#include "shared/core/Guard.hpp"
#include "shared/domain/ValueObject.hpp"
namespace AvancedLibrary {
    Email::Email(std::string &email) : Domain::ValueObject<std::string>(Domain::DomainPrimitive<std::string>{email}) {
        validate(this->props);
    }
    void Email::validate(const Domain::ValueObjectProps<std::string> &props) const {
        if (Core::Guard::isEmpty(props.getValue()).succeeded) throw EmptyStringExcepiton("The email cannot be emtpy.");
        if (!Email::isValidEmail(props.getValue()))
            throw InvalidArgumentFormat(std::format("Invalid email format : {}", props.getValue()));
    }
    bool Email::isValidEmail(const std::string &email) {
        const std::regex emailPattern(R"(^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)");
        return std::regex_match(email, emailPattern);
    }

}  // namespace AvancedLibrary
