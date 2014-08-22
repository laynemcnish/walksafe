Rails.application.routes.draw do
 root "maps#index"
 # get "register" => "users#new", as: :register
  # resources :login
  resources :maps
  # resources :users
end
