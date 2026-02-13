<?php

namespace App\Repositories;

interface RepositoryInterface
{
  public function getAll($filters = [], $perPage = 15);

  public function getById($id);

  public function create(array $data);

  public function update($id, array $data);

  public function delete($id);
}
