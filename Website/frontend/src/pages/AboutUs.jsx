import React from 'react';
import styled from 'styled-components';

const AboutUsPage = () => {
  return (
    <Container>
      <Header>
        <HeaderContent>
          <LogoLink href="Home page.HTML">
            <img src="/images/image1.png" alt="TrungLH Travel" width="120" />
          </LogoLink>
          <Nav>
            <NavList>
              <NavItem><a href="flight_booking.html">Đặt Vé Máy Bay</a></NavItem>
              <NavItem><a href="hotel_booking.html">Đặt Khách Sạn</a></NavItem>
              <NavItem><a href="payment.html">Nạp tiền</a></NavItem>
            </NavList>
          </Nav>
        </HeaderContent>
      </Header>

      <HeroSection>
        <HeroContent>
          <h1>About Us</h1>
        </HeroContent>
      </HeroSection>

      <MainContent>
        <PromotionSection>
          <div className="text-content">
            <span className="label">PROMOTION</span>
            <h2>Nền tảng du lịch hàng đầu Việt Nam</h2>
            <p>
              TRUNG LH là một công ty du lịch hàng đầu Đông Nam Á, cho phép người dùng khám phá,
              đặt phòng và trải nghiệm một loạt các dịch vụ du lịch độc đáo. Mỗi tháng có hơn 30
              triệu lượt truy cập website của chúng tôi, giúp họ khám phá các điểm đến tuyệt vời.
            </p>
            <button className="view-packages">View Packages</button>
          </div>
          <div className="image-content">
            <img src="/images/Rectangle19353.png" alt="Beautiful destination" className="destination-image" />
          </div>
        </PromotionSection>

        <FounderSection>
          <img src="/images/Boss.png" alt="Founder" className="founder-image" />
          <div className="founder-text">
            <p>
              Được thành lập vào năm 2023 bởi ông LÊ HOÀNG TRUNG, một doanh nhân thành đạt
              trong các lĩnh vực du lịch và công nghệ. Chúng tôi là một nền tảng du lịch trực tuyến
              hàng đầu tại Việt Nam, song hành với thành lập Trung LH Travel. Bên cạnh Trung LH Travel
              còn phát triển thêm nhiều ở thị trường Đông Nam Á và du lịch vực nước ngoài.
            </p>
            <div className="play-button">
              <img src="/images/play-button.svg" alt="Play video" />
            </div>
          </div>
        </FounderSection>

        <StatisticsSection>
          <div className="stat-container">
            <div className="stat-item">
              <h3>78%</h3>
              <p>VACATIONS</p>
            </div>
            <div className="stat-item">
              <h3>55%</h3>
              <p>HONEYMOON</p>
            </div>
            <div className="stat-item">
              <h3>30%</h3>
              <p>MUSICAL EVENTS</p>
            </div>
          </div>
          <div className="explore-more">
            <h2>Our Popular Tour Plans</h2>
            <button>EXPLORE MORE</button>
          </div>
        </StatisticsSection>

        <TestimonialsSection>
          <h2>See What Our Clients Say About Us</h2>
          <div className="testimonials-container">
            {/* Add testimonial cards here */}
          </div>
        </TestimonialsSection>
      </MainContent>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  overflow: hidden;
`;

const Header = styled.div`
  background-color: #fff;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
`;

const LogoLink = styled.a`
  text-decoration: none;
  color: #000;
  margin-right: 2rem;

  img {
    width: 120px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  gap: 2rem;
`;

const NavItem = styled.li`
  a {
    text-decoration: none;
    color: #000;
  }
`;

const HeroSection = styled.div`
  background-image: url('/images/About Us Page.png');
  background-size: cover;
  background-position: center;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
  }
`;

const HeroContent = styled.div`
  text-align: center;
  position: relative;
  z-index: 1;

  h1 {
    font-size: 4rem;
    font-weight: bold;
    margin: 0;
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`;

const PromotionSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-bottom: 4rem;

  .text-content {
    .label {
      color: #ff6b6b;
      font-weight: 600;
    }

    h2 {
      font-size: 2.5rem;
      margin: 1rem 0;
    }

    button {
      background-color: #ff6b6b;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 2rem;
    }
  }

  .image-content {
    img {
      width: 100%;
      border-radius: 20px;
    }
  }
`;

const FounderSection = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4rem;
  margin: 6rem 0;
  align-items: center;

  .founder-image {
    width: 300px;
    border-radius: 50%;
  }

  .founder-text {
    position: relative;
    
    p {
      font-size: 1.1rem;
      line-height: 1.8;
    }

    .play-button {
      position: absolute;
      bottom: -3rem;
      right: 0;
      cursor: pointer;
      
      img {
        width: 60px;
        height: 60px;
      }
    }
  }
`;

const StatisticsSection = styled.div`
  background-color: #f8f9fa;
  padding: 4rem;
  border-radius: 20px;
  margin: 6rem 0;

  .stat-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .stat-item {
    text-align: center;

    h3 {
      font-size: 2.5rem;
      color: #ff6b6b;
      margin: 0;
    }

    p {
      margin: 0;
      color: #666;
    }
  }

  .explore-more {
    text-align: center;

    h2 {
      font-size: 2rem;
      margin-bottom: 2rem;
    }

    button {
      background-color: #ff6b6b;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 5px;
      cursor: pointer;
    }
  }
`;

const TestimonialsSection = styled.div`
  text-align: center;
  margin: 6rem 0;

  h2 {
    font-size: 2rem;
    margin-bottom: 3rem;
  }

  .testimonials-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
`;

export default AboutUsPage; 