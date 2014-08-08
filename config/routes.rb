Rails.application.routes.draw do
 root "welcome#index"
 get "register" => "users#new", as: :register
  resources :login
  resources :maps
  resources :users
end
