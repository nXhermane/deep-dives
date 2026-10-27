#include <algorithm>
#include <string>

#include "domain/entities/User.hpp"
#include "domain/value-objects/Email.hpp"
#include "infra/mappers/UserMapper.hpp"
#include "shared/domain/Entity.hpp"
#include "shared/utils/time_utils.hpp"
namespace AvancedLibrary {
    UserMapper::UserMapper() {}
    UserPersistenceDto UserMapper::toPersistence(const User& user) const {
        UserPersistenceDto userDto{
            user.getId(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getProps().name,
            user.getProps().username,
            user.getProps().email.unpack(),
            user.getProps().maxLoan,
        };
        auto activeLoans = user.getProps().activeLoans;
        userDto.activeLoans.resize(activeLoans.size());
        std::transform(activeLoans.begin(), activeLoans.end(), userDto.activeLoans.begin(),
                       [](const auto& loan) -> std::string { return loan.getId(); });
        auto loanHistory = user.getProps().loanHistory;
        userDto.loanHistory.resize(loanHistory.size());
        std::transform(loanHistory.begin(), loanHistory.end(), userDto.loanHistory.begin(),
                       [](const auto& loan) -> std::string { return loan.getId(); });
        userDto.penalties = user.getProps().penalties;
        return userDto;
    }
    User UserMapper::toDomain(const UserToDomainRecord& userRecord) const {
        std::string email{userRecord.email};
        Domain::CreateEntityProps<UserProps> entityProps{
            userRecord.id, Utils::stringToTimePoint(userRecord.createdAt),
            Utils::stringToTimePoint(userRecord.updatedAt),
            UserProps{userRecord.name, userRecord.username, Email{email}, userRecord.maxLoan, userRecord.activeLoans,
                      userRecord.loanHistory, userRecord.penalties}};
        return User(entityProps);
    }
}  // namespace AvancedLibrary