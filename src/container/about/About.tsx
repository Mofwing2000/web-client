import React, { memo } from 'react';

const About = () => {
    return (
        <div>
            <section className="about spad">
                <div className="container">
                    <div className="row mb-5">
                        <div className="col-lg-12">
                            <div className="about__pic">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/online-shop-c6693.appspot.com/o/about-us.jpg?alt=media&token=9083a562-a96a-442d-83f6-e7de5768810e"
                                    alt="store-image"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-4 col-md-4 col-sm-6">
                            <div className="about__item">
                                <h4 className="fw-bold mt-3">Who We Are ?</h4>
                                <p>
                                    Contextual advertising programs sometimes have strict policies that need to be
                                    adhered too. Let’s take Google as an example.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-6">
                            <div className="about__item">
                                <h4 className="fw-bold mt-3">What We Do ?</h4>
                                <p>
                                    In this digital generation where information can be easily obtained within seconds,
                                    business cards still have retained their importance.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-6">
                            <div className="about__item">
                                <h4 className="fw-bold mt-3">Why Choose Us</h4>
                                <p>
                                    A two or three storey house is the ideal way to maximise the piece of earth on which
                                    our home sits, but for older or infirm people.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="team mb-5">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title">
                                <span>Our Team</span>
                                <h2>Meet Our Team</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="team__item">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/online-shop-c6693.appspot.com/o/team-1.jpg?alt=media&token=4457cb19-a6ac-4b61-8a15-c49469df02fb"
                                    alt="person1"
                                />
                                <h4 className="text-bold mt-3">John Smith</h4>
                                <span>Fashion Design</span>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="team__item">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/online-shop-c6693.appspot.com/o/team-2.jpg?alt=media&token=330b2e95-bccb-4696-98c6-e411ce85e3d2"
                                    alt="person2"
                                />
                                <h4 className="text-bold mt-3">Christine Wise</h4>
                                <span>C.E.O</span>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="team__item">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/online-shop-c6693.appspot.com/o/team-3.jpg?alt=media&token=39c80eb5-181b-4b15-b058-5aa2e4941d25"
                                    alt="person3"
                                />
                                <h4 className="text-bold mt-3">Sean Robbins</h4>
                                <span>Manager</span>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="team__item">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/online-shop-c6693.appspot.com/o/team-4.jpg?alt=media&token=fb6877b4-69e1-43c8-802e-2b82991ff526"
                                    alt="person4"
                                />
                                <h4 className="text-bold mt-3">Lucy Myers</h4>
                                <span>Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default memo(About);
