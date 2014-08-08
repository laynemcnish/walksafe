require "rails_helper"

feature "Homepage" do
  scenario "an anonymous user can see the homepage" do
    visit "/"
    expect(page).to have_content("Welcome to Safe Walk!")
  end
end