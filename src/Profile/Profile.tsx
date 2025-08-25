import './Profile.css'

export default function Profile() {
    const userData = {
        name: "Иван",
        surname: "Иванов", 
        patronymic: "Иванович",
        login: "ivanovii",
        leader: "Петр Петрович Сидоров",
        position: "Старший разработчик",
        email: "ivanovii@company.com",
        phone: "+7 (999) 123-45-67"
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2 className="profile-title">Личный кабинет</h2>
                
                <div className="profile-avatar">
                    <div className="avatar-circle">
                        {userData.name[0]}{userData.surname[0]}
                    </div>
                    <h3>{userData.surname} {userData.name} {userData.patronymic}</h3>
                    <p>{userData.position}</p>
                </div>

                <div className="profile-info">
                    <div className="info-item">
                        <span className="info-label">Логин:</span>
                        <span className="info-value">{userData.login}</span>
                    </div>
                    
                    <div className="info-item">
                        <span className="info-label">Руководитель:</span>
                        <span className="info-value">{userData.leader}</span>
                    </div>
                </div>

                <button className="logout-btn">
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    )
}