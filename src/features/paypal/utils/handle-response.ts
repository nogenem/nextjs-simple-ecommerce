export async function handleResponse<TJsonResponse = unknown>(
  response: Response,
): Promise<TJsonResponse> {
  if (response.status === 200 || response.status === 201) {
    return response.json() as TJsonResponse;
  }

  const errorMessage = await response.text();
  throw new Error(errorMessage);
}
